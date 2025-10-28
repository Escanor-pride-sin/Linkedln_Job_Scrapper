class LinkedInScraper {
  constructor(browser) {
    this.browser = browser;
  }

  // Helper: Random delay to mimic human behavior
  async randomDelay(min, max) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // Login to LinkedIn
  async login(page, email, password) {
    try {
      // Navigate to login page
      await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle2' });
      await this.randomDelay(1000, 2000);

      // Wait for login form
      await page.waitForSelector('input#username', { timeout: 15000 });

      // Type email with delay between keystrokes
      await page.type('input#username', email, { delay: 100 });
      await this.randomDelay(500, 1000);

      // Type password with delay between keystrokes
      await page.type('input#password', password, { delay: 150 });
      await this.randomDelay(500, 1000);

      // Click submit button
      await page.click('button[type="submit"]');

      // Wait for navigation or error
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }),
        page.waitForSelector('nav.global-nav', { timeout: 15000 })
      ]);

      await this.randomDelay(2000, 3000);

      // Check for errors
      const currentUrl = page.url();

      // Check for CAPTCHA
      const captchaElement = await page.$('.captcha-internal');
      if (captchaElement) {
        return { success: false, error: 'CAPTCHA detected. Please try again later or use LinkedIn less frequently.' };
      }

      // Check for authentication error
      const alertElement = await page.$('.alert-content');
      if (alertElement) {
        return { success: false, error: 'LinkedIn authentication failed. Check credentials.' };
      }

      // Check for 2FA or checkpoint
      if (currentUrl.includes('/checkpoint/challenge')) {
        return { success: false, error: 'Two-factor authentication not supported. Please disable 2FA temporarily.' };
      }

      // Check for account restriction
      if (currentUrl.includes('unusual activity')) {
        return { success: false, error: 'LinkedIn account temporarily restricted. Please login manually to verify your account.' };
      }

      // Check for successful login
      if (currentUrl.includes('linkedin.com/feed') || currentUrl.includes('linkedin.com/')) {
        const navElement = await page.$('nav.global-nav');
        if (navElement) {
          return { success: true };
        }
      }

      return { success: false, error: 'Login timeout. Please try again.' };

    } catch (error) {
      console.error('Login error:', error.message);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  // Search for posts
  async searchPosts(page, role, location, timeRange) {
    try {
      // Construct search query
      const searchQuery = `"${role}" ${location} (hiring OR "we're hiring" OR "join our team" OR "now hiring" OR "we are hiring")`;
      const encodedQuery = encodeURIComponent(searchQuery);

      // Construct LinkedIn search URL
      const searchUrl = `https://www.linkedin.com/search/results/content/?keywords=${encodedQuery}&sortBy=date_posted`;

      // Navigate to search results
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 15000 });
      await this.randomDelay(2000, 3000);

      // Wait for search results container
      try {
        await page.waitForSelector('div.search-results-container, ul.reusable-search__entity-result-list', { timeout: 10000 });
      } catch (error) {
        // No results found
        return { success: false, error: 'No results found for search criteria.' };
      }

      // Apply time range filter (optional - may not always be available)
      try {
        // Try to click date filter button
        const dateFilterButton = await page.$('button[aria-label*="Date posted"]');
        if (dateFilterButton) {
          await dateFilterButton.click();
          await this.randomDelay(1000, 1500);

          // Select appropriate time range
          let filterText = 'Past 24 hours';
          if (timeRange === 'Last Week') {
            filterText = 'Past Week';
          } else if (timeRange === 'Last Month') {
            filterText = 'Past Month';
          }

          // Find and click the filter option
          const filterOption = await page.evaluateHandle((text) => {
            const buttons = Array.from(document.querySelectorAll('button, li'));
            return buttons.find(btn => btn.textContent.includes(text));
          }, filterText);

          if (filterOption) {
            await filterOption.click();
            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
            await this.randomDelay(2000, 3000);
          }
        }
      } catch (error) {
        console.warn('Could not apply date filter, proceeding without it');
      }

      // Scroll to load more results
      for (let i = 0; i < 8; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await this.randomDelay(1500, 2500);
      }

      return { success: true };

    } catch (error) {
      console.error('Search error:', error.message);
      return { success: false, error: 'Search failed. Please try again.' };
    }
  }

  // Extract posts from page
  async extractPosts(page, maxResults) {
    try {
      const posts = await page.evaluate((maxResults) => {
        const postContainers = document.querySelectorAll('div.feed-shared-update-v2, li.reusable-search__result-container');
        const extractedPosts = [];

        for (let i = 0; i < Math.min(postContainers.length, maxResults); i++) {
          const container = postContainers[i];

          try {
            // Extract poster name
            const nameElement = container.querySelector('span.update-components-actor__name, span[dir="ltr"] > span[aria-hidden="true"]');
            const posterName = nameElement ? nameElement.textContent.trim() : 'Unknown';

            // Extract poster title
            const titleElement = container.querySelector('span.update-components-actor__description, .update-components-actor__sub-description');
            const posterTitle = titleElement ? titleElement.textContent.trim() : 'N/A';

            // Extract post text
            const seeMoreButton = container.querySelector('button.feed-shared-text__see-more-link');
            if (seeMoreButton) {
              seeMoreButton.click();
            }

            const textElement = container.querySelector('div.feed-shared-update-v2__description, div.update-components-text, .feed-shared-inline-show-more-text');
            const postText = textElement ? textElement.textContent.trim() : '';

            // Extract date
            const dateElement = container.querySelector('span.update-components-actor__sub-description > span.visually-hidden, time');
            let dateText = dateElement ? dateElement.textContent.trim() : '';

            // Convert relative time to ISO timestamp
            const now = new Date();
            let datePosted = now.toISOString();

            if (dateText.includes('h')) {
              const hours = parseInt(dateText);
              now.setHours(now.getHours() - hours);
              datePosted = now.toISOString();
            } else if (dateText.includes('d')) {
              const days = parseInt(dateText);
              now.setDate(now.getDate() - days);
              datePosted = now.toISOString();
            } else if (dateText.includes('w')) {
              const weeks = parseInt(dateText);
              now.setDate(now.getDate() - (weeks * 7));
              datePosted = now.toISOString();
            } else if (dateText.includes('mo')) {
              const months = parseInt(dateText);
              now.setMonth(now.getMonth() - months);
              datePosted = now.toISOString();
            }

            // Extract post URL
            const linkElement = container.querySelector('a.app-aware-link');
            let postUrl = linkElement ? linkElement.href : '#';
            if (postUrl && !postUrl.startsWith('http')) {
              postUrl = 'https://www.linkedin.com' + postUrl;
            }

            // Create post object
            extractedPosts.push({
              posterName,
              posterTitle,
              postText,
              datePosted,
              postUrl
            });

          } catch (error) {
            console.warn('Failed to extract post at index', i);
          }
        }

        return extractedPosts;
      }, maxResults);

      return posts;

    } catch (error) {
      console.error('Extract error:', error.message);
      return [];
    }
  }

  // Main scrape method
  async scrape(credentials, searchParams) {
    let page = null;

    try {
      const { email, password } = credentials;
      const { role, location, timeRange, maxResults } = searchParams;

      // Open new page
      page = await this.browser.newPage();

      // Set user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // Login
      const loginResult = await this.login(page, email, password);
      if (!loginResult.success) {
        await page.close();
        return { success: false, error: loginResult.error };
      }

      // Random delay after login
      await this.randomDelay(2000, 4000);

      // Search posts
      const searchResult = await this.searchPosts(page, role, location, timeRange);
      if (!searchResult.success) {
        await page.close();
        return { success: false, error: searchResult.error };
      }

      // Extract posts
      const posts = await this.extractPosts(page, maxResults);

      // Close page
      await page.close();

      // Process posts to add job details
      const processedPosts = posts.map(post => {
        // Try to extract job title from post text
        let jobTitle = role;
        const hiringPatterns = [
          new RegExp(`hiring (?:a |an )?([^.!,]+?)(?:for|to|in|at|\\.|!|,)`, 'i'),
          new RegExp(`looking for (?:a |an )?([^.!,]+?)(?:for|to|in|at|\\.|!|,)`, 'i'),
          new RegExp(`([^.!,]+?)position`, 'i')
        ];

        for (const pattern of hiringPatterns) {
          const match = post.postText.match(pattern);
          if (match && match[1]) {
            jobTitle = match[1].trim();
            break;
          }
        }

        // Try to extract location from post text
        let extractedLocation = location;
        const locationPatterns = [
          new RegExp(`in ([^.!,]+?)(?:for|to|at|\\.|!|,)`, 'i'),
          new RegExp(`at ([^.!,]+?)(?:for|to|in|\\.|!|,)`, 'i'),
          new RegExp(`([^.!,]+?)based`, 'i'),
          new RegExp(`location:?\\s*([^.!,]+)`, 'i')
        ];

        for (const pattern of locationPatterns) {
          const match = post.postText.match(pattern);
          if (match && match[1] && match[1].toLowerCase().includes(location.toLowerCase())) {
            extractedLocation = match[1].trim();
            break;
          }
        }

        return {
          id: post.postUrl.split('/').pop() || Date.now().toString(),
          posterName: post.posterName,
          posterTitle: post.posterTitle,
          postText: post.postText,
          jobTitle: jobTitle,
          location: extractedLocation,
          datePosted: post.datePosted,
          postUrl: post.postUrl
        };
      });

      return { success: true, posts: processedPosts };

    } catch (error) {
      console.error('Scrape error:', error.message);
      if (page) {
        await page.close().catch(() => {});
      }
      return { success: false, error: 'An unexpected error occurred during scraping.' };
    }
  }
}

module.exports = LinkedInScraper;
