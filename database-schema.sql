-- TV.RUSLANMV.COM Database Schema
-- PostgreSQL 16+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- Episodes Table
CREATE TABLE episodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    episode_number SERIAL UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    youtube_url VARCHAR(512) NOT NULL,
    youtube_id VARCHAR(50) NOT NULL,
    duration INTEGER NOT NULL, -- in seconds
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    transcript TEXT,
    metadata JSONB DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_episodes_published_at ON episodes(published_at DESC);
CREATE INDEX idx_episodes_episode_number ON episodes(episode_number);
CREATE INDEX idx_episodes_youtube_id ON episodes(youtube_id);
CREATE INDEX idx_episodes_metadata ON episodes USING GIN (metadata);

-- Full-text search index
CREATE INDEX idx_episodes_search ON episodes USING GIN (
    to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(transcript, ''))
);

-- Sections Table
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
    section_type VARCHAR(50) NOT NULL, -- 'news', 'tech', 'deepdive', 'research', 'packages'
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    start_time INTEGER NOT NULL, -- in seconds
    end_time INTEGER NOT NULL, -- in seconds
    order_index INTEGER NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_sections_episode_id ON sections(episode_id);
CREATE INDEX idx_sections_type ON sections(section_type);
CREATE INDEX idx_sections_order ON sections(episode_id, order_index);

-- Full-text search on content
CREATE INDEX idx_sections_content_search ON sections USING GIN (
    to_tsvector('english', title || ' ' || content)
);

-- Packages Table
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    description TEXT,
    pypi_url VARCHAR(512),
    github_url VARCHAR(512),
    documentation_url VARCHAR(512),
    stars INTEGER DEFAULT 0,
    downloads_last_month INTEGER DEFAULT 0,
    category VARCHAR(100), -- 'AI/ML', 'Web', 'Data', etc.
    tags TEXT[], -- Array of tags
    featured_date DATE,
    is_trending BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_packages_name ON packages(name);
CREATE INDEX idx_packages_featured_date ON packages(featured_date DESC);
CREATE INDEX idx_packages_trending ON packages(is_trending) WHERE is_trending = TRUE;
CREATE INDEX idx_packages_category ON packages(category);
CREATE INDEX idx_packages_tags ON packages USING GIN (tags);

-- Episode Packages Junction Table (many-to-many)
CREATE TABLE episode_packages (
    episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    featured_in_section UUID REFERENCES sections(id) ON DELETE SET NULL,
    PRIMARY KEY (episode_id, package_id)
);

CREATE INDEX idx_episode_packages_episode ON episode_packages(episode_id);
CREATE INDEX idx_episode_packages_package ON episode_packages(package_id);

-- News Sources Table
CREATE TABLE news_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_name VARCHAR(255) NOT NULL,
    source_url VARCHAR(512) NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_scraped_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_news_sources_active ON news_sources(is_active) WHERE is_active = TRUE;

-- News Articles Table
CREATE TABLE news_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID REFERENCES news_sources(id) ON DELETE SET NULL,
    title VARCHAR(512) NOT NULL,
    url VARCHAR(512) NOT NULL UNIQUE,
    summary TEXT,
    published_date TIMESTAMP WITH TIME ZONE,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    featured_in_episode UUID REFERENCES episodes(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_news_articles_source ON news_articles(source_id);
CREATE INDEX idx_news_articles_published ON news_articles(published_date DESC);
CREATE INDEX idx_news_articles_episode ON news_articles(featured_in_episode);

-- Research Papers Table
CREATE TABLE research_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    arxiv_id VARCHAR(50) UNIQUE,
    title VARCHAR(512) NOT NULL,
    authors TEXT[],
    abstract TEXT,
    published_date DATE,
    paper_url VARCHAR(512),
    pdf_url VARCHAR(512),
    categories TEXT[],
    featured_in_episode UUID REFERENCES episodes(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_papers_arxiv ON research_papers(arxiv_id);
CREATE INDEX idx_papers_published ON research_papers(published_date DESC);
CREATE INDEX idx_papers_episode ON research_papers(featured_in_episode);
CREATE INDEX idx_papers_categories ON research_papers USING GIN (categories);

-- Analytics Table
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL, -- 'view', 'play', 'complete', 'section_view'
    metric_value INTEGER DEFAULT 1,
    section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
    user_agent TEXT,
    ip_hash VARCHAR(64), -- Hashed IP for privacy
    metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_episode ON analytics(episode_id);
CREATE INDEX idx_analytics_type ON analytics(metric_type);
CREATE INDEX idx_analytics_recorded ON analytics(recorded_at DESC);

-- API Access Log (for MCP server)
CREATE TABLE api_access_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    tool_name VARCHAR(100), -- MCP tool name
    episode_id UUID REFERENCES episodes(id) ON DELETE SET NULL,
    response_time_ms INTEGER,
    status_code INTEGER,
    error_message TEXT,
    client_id VARCHAR(255), -- AI agent identifier
    metadata JSONB DEFAULT '{}',
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_api_log_endpoint ON api_access_log(endpoint);
CREATE INDEX idx_api_log_episode ON api_access_log(episode_id);
CREATE INDEX idx_api_log_accessed ON api_access_log(accessed_at DESC);

-- Functions and Triggers

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_episodes_updated_at
    BEFORE UPDATE ON episodes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sections_updated_at
    BEFORE UPDATE ON sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at
    BEFORE UPDATE ON packages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to get trending packages
CREATE OR REPLACE FUNCTION get_trending_packages(days_back INTEGER DEFAULT 7, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    description TEXT,
    stars INTEGER,
    downloads_last_month INTEGER,
    trending_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.description,
        p.stars,
        p.downloads_last_month,
        (p.stars * 0.6 + p.downloads_last_month * 0.4)::NUMERIC as trending_score
    FROM packages p
    WHERE p.featured_date >= CURRENT_DATE - days_back
       OR p.is_trending = TRUE
    ORDER BY trending_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to search episodes
CREATE OR REPLACE FUNCTION search_episodes(
    search_query TEXT,
    limit_count INTEGER DEFAULT 10,
    date_from TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    date_to TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    episode_number INTEGER,
    title VARCHAR,
    description TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.episode_number,
        e.title,
        e.description,
        e.published_at,
        ts_rank(
            to_tsvector('english', e.title || ' ' || COALESCE(e.description, '') || ' ' || COALESCE(e.transcript, '')),
            plainto_tsquery('english', search_query)
        ) as rank
    FROM episodes e
    WHERE 
        to_tsvector('english', e.title || ' ' || COALESCE(e.description, '') || ' ' || COALESCE(e.transcript, '')) 
        @@ plainto_tsquery('english', search_query)
        AND (date_from IS NULL OR e.published_at >= date_from)
        AND (date_to IS NULL OR e.published_at <= date_to)
    ORDER BY rank DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Views

-- Today's Episode View
CREATE OR REPLACE VIEW today_episode AS
SELECT * FROM episodes
WHERE DATE(published_at) = CURRENT_DATE
ORDER BY published_at DESC
LIMIT 1;

-- Latest Episodes View
CREATE OR REPLACE VIEW latest_episodes AS
SELECT 
    id,
    episode_number,
    title,
    description,
    youtube_url,
    duration,
    published_at,
    view_count
FROM episodes
ORDER BY published_at DESC
LIMIT 20;

-- Episode Stats View
CREATE OR REPLACE VIEW episode_stats AS
SELECT 
    e.id,
    e.episode_number,
    e.title,
    e.published_at,
    e.view_count,
    COUNT(DISTINCT s.id) as section_count,
    COUNT(DISTINCT ep.package_id) as package_count,
    COUNT(DISTINCT a.id) FILTER (WHERE a.metric_type = 'complete') as completion_count
FROM episodes e
LEFT JOIN sections s ON e.id = s.episode_id
LEFT JOIN episode_packages ep ON e.id = ep.episode_id
LEFT JOIN analytics a ON e.id = a.episode_id
GROUP BY e.id, e.episode_number, e.title, e.published_at, e.view_count;

-- Grants (adjust user as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO tvuser;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO tvuser;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO tvuser;

-- Comments
COMMENT ON TABLE episodes IS 'Main table storing TV episode metadata and content';
COMMENT ON TABLE sections IS 'Individual sections within each episode';
COMMENT ON TABLE packages IS 'Python packages and AI tools featured in episodes';
COMMENT ON TABLE news_articles IS 'News articles scraped for episode content';
COMMENT ON TABLE research_papers IS 'AI research papers featured in episodes';
COMMENT ON TABLE analytics IS 'User engagement and viewing analytics';
COMMENT ON TABLE api_access_log IS 'MCP server API access logs for AI agents';
