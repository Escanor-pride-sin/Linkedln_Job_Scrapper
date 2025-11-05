import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { aiService } from '../services/aiService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { createError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import {
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseFilters,
  SortOptions,
  AIProcessingRequest,
  DateRange
} from '../../../shared/types.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/expenses - Retrieve expenses with filtering and pagination
router.get('/', asyncHandler(async (req: any, res: any) => {
  const {
    page = '1',
    limit = '50',
    category,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    search,
    voiceInput,
    sortBy = 'date',
    sortOrder = 'desc'
  } = req.query;

  const userId = req.user?.id || 'default-user'; // TODO: Add proper auth

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const offset = (pageNum - 1) * limitNum;

  // Build filters
  const where: any = { userId };

  if (category) {
    where.category = category;
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate as string);
    if (endDate) where.date.lte = new Date(endDate as string);
  }

  if (minAmount || maxAmount) {
    where.amount = {};
    if (minAmount) where.amount.gte = parseFloat(minAmount as string);
    if (maxAmount) where.amount.lte = parseFloat(maxAmount as string);
  }

  if (search) {
    where.OR = [
      { description: { contains: search as string, mode: 'insensitive' } },
      { merchant: { contains: search as string, mode: 'insensitive' } },
      { category: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  if (voiceInput !== undefined) {
    where.voiceInput = voiceInput === 'true';
  }

  // Build sorting
  const orderBy: any = {};
  orderBy[sortBy as string] = sortOrder as string;

  // Get expenses and total count
  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      orderBy,
      skip: offset,
      take: limitNum,
    }),
    prisma.expense.count({ where })
  ]);

  res.json({
    success: true,
    data: expenses.map(expense => ({
      ...expense,
      amount: parseFloat(expense.amount as any),
      confidenceScore: expense.confidenceScore ? parseFloat(expense.confidenceScore as any) : undefined
    })),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }
  });
}));

// POST /api/expenses - Create new expense
router.post('/', asyncHandler(async (req: any, res: any) => {
  const userId = req.user?.id || 'default-user'; // TODO: Add proper auth

  const expenseData: CreateExpenseInput = req.body;

  // If no amount provided, try to extract from description
  if (!expenseData.amount) {
    const result = await aiService.processExpenseTranscript({
      transcript: expenseData.description,
      userContext: await getUserContext(userId)
    });

    expenseData.amount = result.amount;
    expenseData.category = result.category;
    expenseData.subcategory = result.subcategory;
    expenseData.merchant = result.merchant;
    expenseData.description = result.description;
    expenseData.date = result.date;
    expenseData.voiceInput = true;
  }

  const expense = await prisma.expense.create({
    data: {
      ...expenseData,
      userId,
      amount: expenseData.amount!,
      date: expenseData.date ? new Date(expenseData.date) : new Date(),
    }
  });

  logger.info('Expense created', {
    expenseId: expense.id,
    amount: expense.amount,
    category: expense.category
  });

  res.status(201).json({
    success: true,
    data: {
      ...expense,
      amount: parseFloat(expense.amount as any)
    }
  });
}));

// POST /api/expenses/process-voice - Process voice transcript with AI
router.post('/process-voice', asyncHandler(async (req: any, res: any) => {
  const { transcript }: { transcript: string } = req.body;
  const userId = req.user?.id || 'default-user'; // TODO: Add proper auth

  if (!transcript || transcript.trim().length === 0) {
    throw createError('Transcript is required', 400);
  }

  const result = await aiService.processExpenseTranscript({
    transcript,
    userContext: await getUserContext(userId)
  });

  res.json({
    success: true,
    data: {
      transcript,
      expenseData: result
    }
  });
}));

// GET /api/expenses/stats - Get spending statistics
router.get('/stats', asyncHandler(async (req: any, res: any) => {
  const userId = req.user?.id || 'default-user'; // TODO: Add proper auth
  const { period = 'month' } = req.query;

  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const expenses = await prisma.expense.findMany({
    where: {
      userId,
      date: { gte: startDate }
    }
  });

  const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount as any), 0);

  const byCategory = expenses.reduce((acc: any, expense) => {
    const category = expense.category;
    if (!acc[category]) {
      acc[category] = { amount: 0, count: 0 };
    }
    acc[category].amount += parseFloat(expense.amount as any);
    acc[category].count += 1;
    return acc;
  }, {});

  const categoryStats = Object.entries(byCategory).map(([category, data]: any) => ({
    category,
    amount: data.amount,
    count: data.count,
    percentage: (data.amount / total) * 100
  }));

  res.json({
    success: true,
    data: {
      period,
      total,
      count: expenses.length,
      averageExpense: total / expenses.length,
      byCategory: categoryStats,
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    }
  });
}));

// GET /api/expenses/:id - Get single expense
router.get('/:id', asyncHandler(async (req: any, res: any) => {
  const { id } = req.params;
  const userId = req.user?.id || 'default-user'; // TODO: Add proper auth

  const expense = await prisma.expense.findFirst({
    where: { id, userId }
  });

  if (!expense) {
    throw createError('Expense not found', 404);
  }

  res.json({
    success: true,
    data: {
      ...expense,
      amount: parseFloat(expense.amount as any)
    }
  });
}));

// PUT /api/expenses/:id - Update expense
router.put('/:id', asyncHandler(async (req: any, res: any) => {
  const { id } = req.params;
  const userId = req.user?.id || 'default-user'; // TODO: Add proper auth
  const updateData: UpdateExpenseInput = req.body;

  const existingExpense = await prisma.expense.findFirst({
    where: { id, userId }
  });

  if (!existingExpense) {
    throw createError('Expense not found', 404);
  }

  const expense = await prisma.expense.update({
    where: { id },
    data: {
      ...updateData,
      date: updateData.date ? new Date(updateData.date) : undefined,
      amount: updateData.amount ? updateData.amount : undefined
    }
  });

  logger.info('Expense updated', {
    expenseId: expense.id,
    updatedFields: Object.keys(updateData)
  });

  res.json({
    success: true,
    data: {
      ...expense,
      amount: parseFloat(expense.amount as any)
    }
  });
}));

// DELETE /api/expenses/:id - Delete expense
router.delete('/:id', asyncHandler(async (req: any, res: any) => {
  const { id } = req.params;
  const userId = req.user?.id || 'default-user'; // TODO: Add proper auth

  const existingExpense = await prisma.expense.findFirst({
    where: { id, userId }
  });

  if (!existingExpense) {
    throw createError('Expense not found', 404);
  }

  await prisma.expense.delete({
    where: { id }
  });

  logger.info('Expense deleted', {
    expenseId: id,
    amount: existingExpense.amount,
    category: existingExpense.category
  });

  res.json({
    success: true,
    message: 'Expense deleted successfully'
  });
}));

// Helper function to get user context for AI processing
async function getUserContext(userId: string) {
  const [recentExpenses, categories] = await Promise.all([
    prisma.expense.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { category: true, amount: true }
    }),
    prisma.category.findMany({
      where: { userId },
      select: { name: true }
    })
  ]);

  const recentCategories = [...new Set(recentExpenses.map(e => e.category))];
  const spendingPatterns = recentExpenses.reduce((acc, expense) => {
    const category = expense.category;
    const amount = parseFloat(expense.amount as any);
    acc[category] = (acc[category] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);

  return {
    recentCategories,
    spendingPatterns,
    preferences: {
      currency: 'USD',
      defaultCategories: categories.map(c => c.name),
      voiceEnabled: true,
      notifications: true,
      dateFormat: 'MM/dd/yyyy',
      theme: 'light'
    }
  };
}

export default router;