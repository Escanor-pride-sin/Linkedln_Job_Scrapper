class HiringIntentDetector {
  // Check if post has hiring intent
  isHiringPost(postText, posterTitle) {
    const text = postText.toLowerCase();
    const title = posterTitle.toLowerCase();
    let score = 0;

    // Strong hiring indicators (+5 points each)
    const strongHiringIndicators = [
      "we're hiring",
      "we are hiring",
      "we're looking to hire",
      "join our team",
      "join us",
      "now hiring",
      "currently hiring",
      "open position",
      "open role",
      "position open",
      "role open",
      "hiring for",
      "looking for a",
      "seeking a",
      "apply now",
      "apply here",
      "applications open",
      "we have an opening",
      "we have a vacancy",
      "job opening",
      "job opportunity",
      "career opportunity",
      "our company is looking for",
      "exciting opportunity to join"
    ];

    for (const indicator of strongHiringIndicators) {
      if (text.includes(indicator)) {
        score += 5;
      }
    }

    // Job-related action indicators (+3 points each)
    const actionIndicators = [
      "dm me to apply",
      "send me your resume",
      "send your cv",
      "apply at",
      "interested candidates"
    ];

    for (const indicator of actionIndicators) {
      if (text.includes(indicator)) {
        score += 3;
      }
    }

    // Recruiting keywords (+2 points)
    const recruitingKeywords = [
      "recruiting",
      "recruitment"
    ];

    for (const keyword of recruitingKeywords) {
      if (text.includes(keyword) && !text.includes("not recruiting")) {
        score += 2;
      }
    }

    // Poster title indicates recruiter/hiring manager (+2 points)
    const recruiterTitles = [
      "recruiter",
      "hr",
      "talent acquisition",
      "hiring manager",
      "founder",
      "ceo",
      "cto",
      "head of"
    ];

    for (const titleKeyword of recruiterTitles) {
      if (title.includes(titleKeyword)) {
        score += 2;
        break;
      }
    }

    // Job seeker indicators (-10 points each)
    const jobSeekerIndicators = [
      "i'm looking for",
      "i am looking for",
      "looking for a job",
      "seeking opportunities",
      "seeking a role",
      "seeking employment",
      "available for",
      "open to opportunities",
      "actively looking",
      "actively seeking",
      "job search",
      "searching for a job",
      "i need a job",
      "need work",
      "unemployed",
      "looking for work",
      "open to work",
      "anyone hiring",
      "are you hiring",
      "please hire me",
      "can you help me find",
      "fresher looking for",
      "graduate seeking",
      "help me find a job",
      "need a job"
    ];

    for (const indicator of jobSeekerIndicators) {
      if (text.includes(indicator)) {
        score -= 10;
      }
    }

    // Return true if score >= 5 (hiring post), false otherwise
    return score >= 5;
  }

  // Extract hiring intent summary (first 150 chars with hiring keywords)
  extractHiringIntent(postText) {
    const text = postText.trim();

    // Try to find sentences with hiring keywords
    const sentences = text.split(/[.!?]+/);
    let hiringText = '';

    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      if (
        lowerSentence.includes('hiring') ||
        lowerSentence.includes('join') ||
        lowerSentence.includes('opportunity') ||
        lowerSentence.includes('looking for') ||
        lowerSentence.includes('seeking')
      ) {
        hiringText = sentence.trim();
        break;
      }
    }

    // If no hiring sentence found, use beginning of text
    if (!hiringText) {
      hiringText = text;
    }

    // Truncate to 150 characters
    if (hiringText.length > 150) {
      hiringText = hiringText.substring(0, 147) + '...';
    }

    return hiringText;
  }

  // Filter posts for hiring intent
  filterHiringPosts(posts) {
    const filtered = [];

    for (const post of posts) {
      if (this.isHiringPost(post.postText, post.posterTitle)) {
        // Add hiringIntent field
        const hiringIntent = this.extractHiringIntent(post.postText);

        filtered.push({
          id: post.id,
          posterName: post.posterName,
          posterTitle: post.posterTitle,
          jobTitle: post.jobTitle,
          location: post.location,
          datePosted: post.datePosted,
          hiringIntent: hiringIntent,
          postUrl: post.postUrl
        });
      }
    }

    return filtered;
  }
}

module.exports = HiringIntentDetector;
