class InstagramPostExtractor {
    constructor() {
        this.posts = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const fileInput = document.getElementById('htmlFile');
        const extractBtn = document.getElementById('extractBtn');
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
        a.download = 'instagram_posts_summary.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    generateSummaryHtml() {
        const currentDate = new Date().toLocaleDateString();
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instagram Posts Summary - ${currentDate}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #eee;
        }
        .post-item {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            border-left: 4px solid #667eea;
        }
        .post-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            flex-wrap: wrap;
            gap: 10px;
        }
        .post-id {
            font-family: 'Courier New', monospace;
            background: #e9ecef;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 0.9rem;
        }
        .instagram-link {
            color: #E4405F;
            text-decoration: none;
            font-weight: 500;
        }
        .instagram-link:hover {
            text-decoration: underline;
        }
        .summary {
            margin-top: 10px;
        }
        .stats {
            background: #667eea;
            color: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 30px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Instagram Posts Summary</h1>
        <p>Generated on ${currentDate}</p>
    </div>
    
    <div class="stats">
        <strong>Total Posts Found: ${this.posts.length}</strong>
    </div>
    
    ${this.posts.map(post => `
        <div class="post-item">
            <div class="post-header">
                <span class="post-id">${post.type === 'reel' ? 'Reel' : 'Post'} #${post.index}: ${post.id}</span>
                <a href="${post.url}" target="_blank" class="instagram-link">View on Instagram →</a>
            </div>
            <div class="summary">
                <strong>Summary:</strong> ${post.summary}
            </div>
        </div>
    `).join('')}
    
    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666;">
        <p>Summary generated by Instagram Post Extractor</p>
    </div>
</body>
</html>`;
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new InstagramPostExtractor();
});