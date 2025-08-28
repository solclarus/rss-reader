import { Calendar, User } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Article {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  author: string;
}


interface ArticleListProps {
  articles: Article[];
  feedTitle: string;
  faviconUrl?: string;
}

export function ArticleList({
  articles,
  feedTitle,
  faviconUrl,
}: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <motion.div
        className="text-center text-muted-foreground py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        記事が見つかりませんでした
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex items-center gap-3 mb-4 sm:mb-6 px-1"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {faviconUrl && (
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-sm overflow-hidden flex-shrink-0">
            <img
              src={faviconUrl}
              alt="サイトロゴ"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}
        <h2 className="text-xl sm:text-2xl font-bold bg-clip-text">
          {feedTitle}
        </h2>
      </motion.div>
      <motion.div
        className="space-y-3 sm:space-y-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {articles.map((article, index) => (
          <motion.div
            key={`${article.link}-${index}`}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Link
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="hover:shadow-lg hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20 transition-all duration-300 cursor-pointer border-gray-200/60 hover:border-blue-200 dark:hover:border-blue-800">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-sm sm:text-base leading-tight">
                      <span className="text-primary hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2 transition-colors duration-200">
                        {article.title}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
                      {article.pubDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                          {new Date(article.pubDate).toLocaleDateString(
                            "ja-JP",
                          )}
                        </span>
                      )}
                      {article.author && (
                        <span className="flex items-center gap-1 truncate max-w-32">
                          <User className="h-3 w-3 text-green-500 dark:text-green-400" />
                          {article.author}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
