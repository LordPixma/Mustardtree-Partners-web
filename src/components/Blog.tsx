import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { blogService } from '../services/blogService';
import { BlogPost } from '../types/blog';

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const publishedPosts = await blogService.getPublishedPosts();
        setPosts(publishedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading articles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 dark:text-white mb-6">
            Insights & Analysis
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Expert insights on corporate governance, business intelligence, and regulatory compliance
            from the MustardTree Partners team.
          </p>
        </motion.div>

        {posts.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No articles published yet. Check back soon!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {post.featuredImage && (
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {post.category && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                        {post.category}
                      </span>
                    )}
                    {post.tags && post.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">{post.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{post.excerpt}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                      </div>
                      {post.readingTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{post.readingTime} min read</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {post.author && (
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                      {post.author.headshot ? (
                        <img src={post.author.headshot} alt={post.author.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                          <User className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{post.author.name}</p>
                        {post.author.position && <p className="text-xs text-gray-500 dark:text-gray-400">{post.author.position}</p>}
                      </div>
                    </div>
                  )}

                  <a href={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400 font-medium transition-colors group">
                    Read Article
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        <div className="text-center mt-16">
          <a href="/" className="inline-flex items-center px-6 py-3 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
