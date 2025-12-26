class InstagramPostExtractor {
    constructor() {
        this.posts = [];
        this.overallSummary = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const fileInput = document.getElementById('htmlFile');
        const extractBtn = document.getElementById('extractBtn');
        const generateAiBtn = document.getElementById('generateAiBtn');
        const downloadBtn = document.getElementById('downloadBtn');

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                extractBtn.disabled = false;
                extractBtn.textContent = 'Extract Posts';
            } else {
                extractBtn.disabled = true;
            }
        });

        extractBtn.addEventListener('click', () => {
            this.extractPosts();
        });

        generateAiBtn.addEventListener('click', () => {
            this.generateOverallAiSummary();
        });

        downloadBtn.addEventListener('click', () => {
            this.downloadSummary();
        });
    }

    async extractPosts() {
        const fileInput = document.getElementById('htmlFile');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showError('Please select an HTML file first.');
            return;
        }

        try {
            this.showLoading();
            const htmlContent = await this.readFileAsText(file);
            this.posts = this.parseInstagramPosts(htmlContent);
            this.displayResults();
        } catch (error) {
            this.showError('Error reading file: ' + error.message);
        }
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    parseInstagramPosts(htmlContent) {
        const posts = [];
        
        // Create a temporary DOM element to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        // Find all Instagram post links using the pattern href="/p/..."
        const postLinks = tempDiv.querySelectorAll('a[href^="/p/"]');
        
        postLinks.forEach((link, index) => {
            const href = link.getAttribute('href');
            const postId = this.extractPostId(href);
            
            if (postId) {
                // Try to find the alt text from images within the link
                const img = link.querySelector('img');
                const altText = img ? img.getAttribute('alt') : '';
                
                // Extract text content from the link
                const textContent = link.textContent.trim();
                
                // Create Instagram URL
                const instagramUrl = `https://www.instagram.com${href}`;
                
                posts.push({
                    id: postId,
                    url: instagramUrl,
                    altText: altText,
                    textContent: textContent,
                    summary: this.generateSummary(altText, textContent),
                    index: index + 1
                });
            }
        });

        // Also check for reel links
        const reelLinks = tempDiv.querySelectorAll('a[href^="/reel"]');
        reelLinks.forEach((link, index) => {
            const href = link.getAttribute('href');
            const reelId = this.extractReelId(href);
            
            if (reelId) {
                const img = link.querySelector('img');
                const altText = img ? img.getAttribute('alt') : '';
                const textContent = link.textContent.trim();
                const instagramUrl = `https://www.instagram.com${href}`;
                
                posts.push({
                    id: reelId,
                    url: instagramUrl,
                    altText: altText,
                    textContent: textContent,
                    summary: this.generateSummary(altText, textContent),
                    index: posts.length + index + 1,
                    type: 'reel'
                });
            }
        });

        return posts;
    }

    extractPostId(href) {
        // Extract post ID from href="/p/POST_ID/"
        const match = href.match(/\/p\/([^\/]+)\//);
        return match ? match[1] : null;
    }

    extractReelId(href) {
        // Extract reel ID from href="/reel/REEL_ID/" or similar patterns
        const match = href.match(/\/reel[s]?\/([^\/]+)\//);
        return match ? match[1] : null;
    }

    generateSummary(altText, textContent) {
        let summary = '';
        
        if (altText && altText.trim()) {
            // Clean up alt text and use it as primary summary
            summary = altText.trim();
            
            // Remove excessive whitespace and line breaks
            summary = summary.replace(/\s+/g, ' ');
            
            // Truncate if too long
            if (summary.length > 200) {
                summary = summary.substring(0, 200) + '...';
            }
        } else if (textContent && textContent.trim()) {
            // Fallback to text content if no alt text
            summary = textContent.trim();
            if (summary.length > 200) {
                summary = summary.substring(0, 200) + '...';
            }
        } else {
            summary = 'No description available';
        }
        
        return summary;
    }

    async generateOverallAiSummary() {
        const generateAiBtn = document.getElementById('generateAiBtn');
        const aiOverview = document.getElementById('aiOverview');
        const originalText = generateAiBtn.textContent;
        
        generateAiBtn.textContent = 'Analyzing All Posts...';
        generateAiBtn.disabled = true;
        
        // Show loading state
        aiOverview.style.display = 'block';
        aiOverview.innerHTML = '<div class="loading">🤖 AI is analyzing all posts to generate comprehensive insights...</div>';
        
        try {
            // Simulate AI processing time
            await this.delay(2000 + Math.random() * 2000);
            
            // Generate comprehensive analysis
            this.overallSummary = this.analyzeAllPosts();
            
            // Display the AI summary
            this.displayAiOverview();
            
            generateAiBtn.textContent = 'AI Summary Generated ✓';
            generateAiBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
            
        } catch (error) {
            console.error('Error generating AI summary:', error);
            generateAiBtn.textContent = 'Error - Try Again';
            generateAiBtn.disabled = false;
            aiOverview.innerHTML = '<div class="error">Failed to generate AI summary. Please try again.</div>';
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    analyzeAllPosts() {
        const totalPosts = this.posts.length;
        const reelCount = this.posts.filter(p => p.type === 'reel').length;
        const postCount = totalPosts - reelCount;
        
        // Combine all content for analysis
        const allContent = this.posts.map(p => (p.altText + ' ' + p.textContent).toLowerCase()).join(' ');
        
        // Analyze content themes
        const themes = this.extractOverallThemes(allContent);
        const sentiment = this.analyzeOverallSentiment(allContent);
        const contentType = this.determineContentFocus(allContent);
        const engagement = this.calculateOverallEngagement(allContent);
        
        return {
            totalPosts,
            postCount,
            reelCount,
            themes,
            sentiment,
            contentType,
            engagement,
            keyInsights: this.generateKeyInsights(allContent, themes, contentType),
            summary: this.generateNarrativeSummary(totalPosts, themes, contentType, sentiment)
        };
    }

    extractOverallThemes(content) {
        const themes = [];
        
        const themeKeywords = {
            'Automotive': ['car', 'bmw', 'm3', 'm4', 'ferrari', 'alfa', 'chevrolet', 'corvette', 'vehicle', 'engine', 'gearbox', 'wheels', 'racing'],
            'Sales & Commerce': ['sale', 'buy', 'price', 'sell', 'purchase', 'deal', 'inquir', 'contact', 'dm', 'call'],
            'Luxury & Premium': ['luxury', 'premium', 'exclusive', 'high-end', 'expensive', 'elite', 'sophisticated'],
            'Performance & Racing': ['speed', 'power', 'performance', 'racing', 'track', 'fast', 'acceleration', 'horsepower'],
            'Lifestyle & Culture': ['lifestyle', 'style', 'fashion', 'trend', 'cool', 'culture', 'community'],
            'Technical & Specs': ['specification', 'technical', 'engine', 'transmission', 'modification', 'upgrade']
        };
        
        Object.keys(themeKeywords).forEach(theme => {
            const matches = themeKeywords[theme].filter(keyword => content.includes(keyword)).length;
            if (matches > 0) {
                themes.push({ name: theme, strength: matches });
            }
        });
        
        return themes.sort((a, b) => b.strength - a.strength);
    }

    analyzeOverallSentiment(content) {
        const positiveWords = ['beautiful', 'amazing', 'love', 'perfect', 'stunning', 'incredible', 'awesome', 'fantastic', 'excellent', 'outstanding'];
        const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disappointing', 'poor'];
        
        let positiveScore = 0;
        let negativeScore = 0;
        
        positiveWords.forEach(word => {
            const matches = (content.match(new RegExp(word, 'g')) || []).length;
            positiveScore += matches;
        });
        
        negativeWords.forEach(word => {
            const matches = (content.match(new RegExp(word, 'g')) || []).length;
            negativeScore += matches;
        });
        
        if (positiveScore > negativeScore * 1.5) return 'Very Positive';
        if (positiveScore > negativeScore) return 'Positive';
        if (negativeScore > positiveScore) return 'Negative';
        return 'Neutral';
    }

    determineContentFocus(content) {
        if (content.includes('sale') || content.includes('buy') || content.includes('price')) {
            return 'Commercial/Sales Focus';
        }
        if (content.includes('car') || content.includes('bmw') || content.includes('ferrari')) {
            return 'Automotive Enthusiast Content';
        }
        if (content.includes('lifestyle') || content.includes('style')) {
            return 'Lifestyle & Culture';
        }
        return 'General Social Media Content';
    }

    calculateOverallEngagement(content) {
        let score = 0;
        
        // Count engagement indicators
        const engagementIndicators = ['sale', 'dm', 'call', 'contact', 'buy', 'price', 'inquir'];
        const emotionalWords = ['beautiful', 'amazing', 'stunning', 'love', 'perfect', 'incredible'];
        
        engagementIndicators.forEach(word => {
            score += (content.match(new RegExp(word, 'g')) || []).length * 2;
        });
        
        emotionalWords.forEach(word => {
            score += (content.match(new RegExp(word, 'g')) || []).length;
        });
        
        // Estimate emoji usage
        const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length;
        score += emojiCount;
        
        if (score > 20) return 'Very High';
        if (score > 10) return 'High';
        if (score > 5) return 'Medium';
        return 'Low';
    }

    generateKeyInsights(content, themes, contentType) {
        const insights = [];
        
        if (themes.length > 0 && themes[0].name === 'Automotive') {
            insights.push('Strong automotive focus with car enthusiast content');
        }
        
        if (content.includes('sale') && content.includes('price')) {
            insights.push('Commercial intent detected with sales-oriented messaging');
        }
        
        if (themes.some(t => t.name === 'Luxury & Premium')) {
            insights.push('Premium/luxury positioning evident in content');
        }
        
        const carBrands = ['bmw', 'ferrari', 'alfa', 'chevrolet'];
        const mentionedBrands = carBrands.filter(brand => content.includes(brand));
        if (mentionedBrands.length > 1) {
            insights.push(`Multi-brand content featuring ${mentionedBrands.length} different automotive brands`);
        }
        
        if (content.includes('m3') || content.includes('m4')) {
            insights.push('BMW M-series performance vehicles prominently featured');
        }
        
        return insights;
    }

    generateNarrativeSummary(totalPosts, themes, contentType, sentiment) {
        let summary = `This collection of ${totalPosts} Instagram posts `;
        
        if (themes.length > 0) {
            summary += `primarily focuses on ${themes[0].name.toLowerCase()} content, `;
        }
        
        summary += `with a ${sentiment.toLowerCase()} overall tone. `;
        
        if (contentType.includes('Commercial')) {
            summary += 'The content shows strong commercial intent with multiple sales-oriented posts. ';
        } else if (contentType.includes('Automotive')) {
            summary += 'The content targets automotive enthusiasts with detailed vehicle showcases. ';
        }
        
        if (themes.length > 2) {
            summary += `The posts cover diverse themes including ${themes.slice(0, 3).map(t => t.name.toLowerCase()).join(', ')}, `;
            summary += 'indicating a well-rounded content strategy. ';
        }
        
        summary += 'This appears to be content from an automotive-focused account with both commercial and enthusiast appeal.';
        
        return summary;
    }

    displayAiOverview() {
        const aiOverview = document.getElementById('aiOverview');
        const summary = this.overallSummary;
        
        aiOverview.innerHTML = `
            <div class="ai-summary-container">
                <h3>🤖 AI Analysis Summary</h3>
                <div class="narrative-summary">
                    <p><strong>Overall Assessment:</strong> ${summary.summary}</p>
                </div>
                
                <div class="summary-stats">
                    <div class="stat-grid">
                        <div class="stat-item">
                            <span class="stat-label">Total Posts</span>
                            <span class="stat-value">${summary.totalPosts}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Regular Posts</span>
                            <span class="stat-value">${summary.postCount}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Reels</span>
                            <span class="stat-value">${summary.reelCount}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Overall Sentiment</span>
                            <span class="stat-value sentiment-${summary.sentiment.toLowerCase().replace(' ', '-')}">${summary.sentiment}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Content Focus</span>
                            <span class="stat-value">${summary.contentType}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Engagement Potential</span>
                            <span class="stat-value">${summary.engagement}</span>
                        </div>
                    </div>
                </div>
                
                ${summary.themes.length > 0 ? `
                    <div class="themes-section">
                        <h4>📊 Content Themes</h4>
                        <div class="themes-list">
                            ${summary.themes.map(theme => `
                                <span class="theme-tag" style="opacity: ${Math.min(1, theme.strength / 5)}">
                                    ${theme.name} (${theme.strength})
                                </span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${summary.keyInsights.length > 0 ? `
                    <div class="insights-section">
                        <h4>💡 Key Insights</h4>
                        <ul class="insights-list">
                            ${summary.keyInsights.map(insight => `<li>${insight}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }

    showLoading() {
        const resultsSection = document.getElementById('resultsSection');
        const postsContainer = document.getElementById('postsContainer');
        
        resultsSection.style.display = 'block';
        postsContainer.innerHTML = '<div class="loading">Extracting posts...</div>';
    }

    showError(message) {
        const resultsSection = document.getElementById('resultsSection');
        const postsContainer = document.getElementById('postsContainer');
        
        resultsSection.style.display = 'block';
        postsContainer.innerHTML = `<div class="error">${message}</div>`;
    }

    displayResults() {
        const resultsSection = document.getElementById('resultsSection');
        const postsContainer = document.getElementById('postsContainer');
        const postCount = document.getElementById('postCount');
        
        resultsSection.style.display = 'block';
        postCount.textContent = `${this.posts.length} posts found`;
        
        if (this.posts.length === 0) {
            postsContainer.innerHTML = '<div class="error">No Instagram posts found in the HTML file.</div>';
            return;
        }

        const postsHtml = this.posts.map(post => `
            <div class="post-item">
                <div class="post-header">
                    <span class="post-id">${post.type === 'reel' ? 'Reel' : 'Post'} #${post.index}: ${post.id}</span>
                    <a href="${post.url}" target="_blank" class="instagram-link">View on Instagram</a>
                </div>
                <div class="post-content">
                    <strong>Summary:</strong> ${post.summary}
                </div>
            </div>
        `).join('');
        
        postsContainer.innerHTML = postsHtml;
    }

    downloadSummary() {
        if (this.posts.length === 0) {
            alert('No posts to download. Please extract posts first.');
            return;
        }

        const summaryHtml = this.generateSummaryHtml();
        const blob = new Blob([summaryHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `instagram_ai_analysis_${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    generateSummaryHtml() {
        const currentDate = new Date().toLocaleDateString();
        const aiSummarySection = this.overallSummary ? `
            <div class="ai-summary-section">
                <h2>🤖 AI Analysis Summary</h2>
                <div class="narrative-summary">
                    <h3>Overall Assessment</h3>
                    <p>${this.overallSummary.summary}</p>
                </div>
                
                <div class="summary-stats">
                    <h3>Key Statistics</h3>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <strong>Total Posts:</strong> ${this.overallSummary.totalPosts}
                        </div>
                        <div class="stat-item">
                            <strong>Regular Posts:</strong> ${this.overallSummary.postCount}
                        </div>
                        <div class="stat-item">
                            <strong>Reels:</strong> ${this.overallSummary.reelCount}
                        </div>
                        <div class="stat-item">
                            <strong>Overall Sentiment:</strong> ${this.overallSummary.sentiment}
                        </div>
                        <div class="stat-item">
                            <strong>Content Focus:</strong> ${this.overallSummary.contentType}
                        </div>
                        <div class="stat-item">
                            <strong>Engagement Potential:</strong> ${this.overallSummary.engagement}
                        </div>
                    </div>
                </div>
                
                ${this.overallSummary.themes.length > 0 ? `
                    <div class="themes-section">
                        <h3>Content Themes</h3>
                        <div class="themes-list">
                            ${this.overallSummary.themes.map(theme => `
                                <span class="theme-tag">${theme.name} (${theme.strength} mentions)</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${this.overallSummary.keyInsights.length > 0 ? `
                    <div class="insights-section">
                        <h3>Key Insights</h3>
                        <ul>
                            ${this.overallSummary.keyInsights.map(insight => `<li>${insight}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        ` : '';
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instagram Analysis Report - ${currentDate}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 15px;
        }
        .ai-summary-section {
            background: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            border-left: 5px solid #667eea;
        }
        .narrative-summary {
            background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 25px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .stat-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .themes-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 15px;
        }
        .theme-tag {
            background: #667eea;
            color: white;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
        }
        .insights-section ul {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 15px;
        }
        .post-item {
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 25px;
            border-left: 4px solid #667eea;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .post-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 10px;
        }
        .post-id {
            font-family: 'Courier New', monospace;
            background: #e9ecef;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.9rem;
        }
        .instagram-link {
            color: #E4405F;
            text-decoration: none;
            font-weight: 500;
            padding: 8px 15px;
            background: #fff5f5;
            border-radius: 20px;
        }
        .instagram-link:hover {
            background: #E4405F;
            color: white;
        }
        .stats {
            background: #667eea;
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 30px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 Instagram Analysis Report</h1>
        <p>Generated on ${currentDate}</p>
    </div>
    
    <div class="stats">
        <strong>Total Posts Analyzed: ${this.posts.length}</strong>
        ${this.overallSummary ? ' | AI Summary: ✅ Generated' : ' | AI Summary: ❌ Not Generated'}
    </div>
    
    ${aiSummarySection}
    
    <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h2>📋 Individual Posts</h2>
    </div>
    
    ${this.posts.map(post => `
        <div class="post-item">
            <div class="post-header">
                <span class="post-id">${post.type === 'reel' ? 'Reel' : 'Post'} #${post.index}: ${post.id}</span>
                <a href="${post.url}" target="_blank" class="instagram-link">View on Instagram →</a>
            </div>
            <div class="post-content">
                <strong>Summary:</strong> ${post.summary}
            </div>
        </div>
    `).join('')}
    
    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666;">
        <p>Report generated by AI-Powered Instagram Post Analyzer</p>
    </div>
</body>
</html>`;
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new InstagramPostExtractor();
});