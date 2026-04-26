import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { articles } from '../data/articles';
import { Helmet } from 'react-helmet-async';
import AdSenseAd from './AdSenseAd';
import SocialShare from './SocialShare';

const Blog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(articles.map(article => article.category))];
    return cats;
  }, []);

  // Filter articles based on selected category and search query
  const filteredArticles = useMemo(() => {
    let filtered = articles;
    
    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [selectedCategory, searchQuery]);
  return (
    <>
      <Helmet>
        <title>Tic-Tac-Toe Blog - Strategies, History, and More</title>
        <meta name="description" content="Read articles about Tic-Tac-Toe strategies, history, game variations, and more. Become a Tic-Tac-Toe master!" />
      </Helmet>
      <div className="container" style={{ maxWidth: 800, margin: '40px auto', background: 'var(--surface)', color: 'var(--text)', padding: '32px 24px', boxShadow: '0 4px 16px rgba(30,136,229,0.07)', borderRadius: 10 }}>
        <h1 style={{ color: 'var(--primary)', fontSize: '2em', marginBottom: '1em', fontWeight: 700 }}>Blog</h1>
        <p style={{ marginBottom: '2em', color: 'var(--text)', fontSize: '1.1em', lineHeight: 1.6 }}>
          Explore articles about Tic-Tac-Toe strategy, history, and more. Our blog is dedicated to helping you become a Tic-Tac-Toe master and learn about the game's fascinating background.
        </p>

        {/* Search and Filter */}
        <div style={{ marginBottom: '2em' }}>
          {/* Search Bar */}
          <div style={{ marginBottom: '1em' }}>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75em 1em',
                border: '1px solid var(--border)',
                borderRadius: 8,
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: '1em',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
              }}
            />
          </div>
          
          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '0.5em', flexWrap: 'wrap' }}>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '0.5em 1em',
                  border: '1px solid var(--border)',
                  borderRadius: 20,
                  background: selectedCategory === category ? 'var(--primary)' : 'transparent',
                  color: selectedCategory === category ? 'white' : 'var(--text)',
                  cursor: 'pointer',
                  fontSize: '0.9em',
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.background = 'var(--primary)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.opacity = '0.8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text)';
                    e.currentTarget.style.opacity = '1';
                  }
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* AdSense Ad */}
        <div style={{ marginBottom: '2em', textAlign: 'center' }}>
          <AdSenseAd slot="8488726422" style={{ display: 'block', width: '100%', minHeight: 90 }} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2em' }}>
          {filteredArticles.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3em 1em', 
              color: 'var(--text-muted)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12
            }}>
              <h3 style={{ marginBottom: '1em', color: 'var(--text)' }}>No articles found</h3>
              <p style={{ marginBottom: '1.5em' }}>
                {searchQuery.trim() 
                  ? `No articles match "${searchQuery}" in ${selectedCategory === 'All' ? 'all categories' : selectedCategory}`
                  : `No articles found in ${selectedCategory}`
                }
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                style={{
                  padding: '0.75em 1.5em',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: '1em',
                  fontWeight: 500
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredArticles.map(article => (
            <article key={article.slug} style={{ 
              background: 'var(--surface)', 
              border: '1px solid var(--border)', 
              borderRadius: 12, 
              padding: '2em', 
              boxShadow: '0 2px 8px rgba(30,136,229,0.05)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(30,136,229,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(30,136,229,0.05)';
            }}
            >
              <Link to={`/blog/${article.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1em', flexWrap: 'wrap', gap: '1em' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ 
                      background: 'var(--primary)', 
                      color: 'white', 
                      padding: '0.25em 0.75em', 
                      borderRadius: 20, 
                      fontSize: '0.8em', 
                      fontWeight: 500,
                      display: 'inline-block',
                      marginBottom: '0.5em'
                    }}>
                      {article.category}
                    </span>
                    <h2 style={{ 
                      color: 'var(--secondary)', 
                      fontSize: '1.4em', 
                      fontWeight: 600, 
                      marginBottom: '0.75em',
                      lineHeight: 1.3
                    }}>
                      {article.title}
                    </h2>
                    <p style={{ 
                      color: 'var(--text)', 
                      marginBottom: '1em',
                      lineHeight: 1.6,
                      fontSize: '1em'
                    }}>
                      {article.excerpt}
                    </p>
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  fontSize: '0.9em',
                  color: 'var(--text-muted)'
                }}>
                  <div style={{ display: 'flex', gap: '1em', alignItems: 'center' }}>
                    <span>{new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                  </div>
                  <span style={{ 
                    color: 'var(--primary)', 
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25em'
                  }}>
                    Read Article →
                  </span>
                </div>
              </Link>
            </article>
            ))
          )}
        </div>
        
        <SocialShare 
          title="Tic-Tac-Toe Blog - Strategies, History, and More"
          description="Read articles about Tic-Tac-Toe strategies, history, game variations, and more. Become a Tic-Tac-Toe master!"
        />
        
        <div style={{ 
          marginTop: '3em', 
          padding: '2em', 
          background: 'var(--primary)', 
          color: 'white', 
          borderRadius: 12, 
          textAlign: 'center' 
        }}>
          <h3 style={{ marginBottom: '1em', fontSize: '1.3em' }}>Want to Play While You Read?</h3>
          <p style={{ marginBottom: '1.5em', opacity: 0.9 }}>
            Put your knowledge to the test with our interactive Tic-Tac-Toe game!
          </p>
          <Link 
            to="/tictactoe" 
            style={{ 
              background: 'white', 
              color: 'var(--primary)', 
              padding: '0.75em 1.5em', 
              borderRadius: 8, 
              textDecoration: 'none', 
              fontWeight: 600,
              display: 'inline-block',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Start Playing Now
          </Link>
        </div>
      </div>
    </>
  );
};

export default Blog; 
