"use client";

import { List, Plus, RefreshCw, Rss, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArticleList } from "@/components/article-list";
import { RSSForm } from "@/components/rss-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Article {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  author: string;
}

interface FeedData {
  feedTitle: string;
  feedDescription: string;
  articles: Article[];
  faviconUrl?: string;
}

interface FeedTab {
  id: string;
  title: string;
  url: string;
  data: FeedData | null;
  isLoading: boolean;
}

const STORAGE_KEYS = {
  TABS: "rss-reader-tabs",
  ACTIVE_TAB: "rss-reader-active-tab",
};

export default function Home() {
  const [tabs, setTabs] = useState<FeedTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>("");
  const [isAddingFeed, setIsAddingFeed] = useState<boolean>(false);
  const [showMobileDialog, setShowMobileDialog] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // ページ読み込み時にタブデータを復元
  useEffect(() => {
    try {
      const savedTabs = localStorage.getItem(STORAGE_KEYS.TABS);
      const savedActiveTab = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);

      if (savedTabs) {
        const parsedTabs = JSON.parse(savedTabs);
        setTabs(parsedTabs);

        if (
          savedActiveTab &&
          parsedTabs.some((tab: FeedTab) => tab.id === savedActiveTab)
        ) {
          setActiveTabId(savedActiveTab);
        } else if (parsedTabs.length > 0) {
          setActiveTabId(parsedTabs[0].id);
        }
      }
    } catch (error) {
      console.error("データの復元に失敗しました:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // タブデータを localStorage に保存
  const saveTabs = (newTabs: FeedTab[], newActiveTabId?: string) => {
    try {
      localStorage.setItem(STORAGE_KEYS.TABS, JSON.stringify(newTabs));
      if (newActiveTabId) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, newActiveTabId);
      }
    } catch (error) {
      console.error("タブデータの保存に失敗しました:", error);
    }
  };

  // URL追加フォームのサブミット
  const handleAddFeedSubmit = async (url: string) => {
    setIsAddingFeed(true);

    const newTab: FeedTab = {
      id: `tab-${Date.now()}`,
      title: "新しいフィード",
      url: url,
      data: null,
      isLoading: true,
    };

    setTabs((prevTabs) => {
      const newTabs = [...prevTabs, newTab];
      saveTabs(newTabs, newTab.id);
      return newTabs;
    });
    setActiveTabId(newTab.id);
    setShowMobileDialog(false); // ダイアログを閉じる

    try {
      // RSS取得処理
      await handleFeedSubmit(url, newTab.id);
    } finally {
      setIsAddingFeed(false);
    }
  };

  // タブを削除
  const removeTab = (tabId: string) => {
    setTabs((prevTabs) => {
      if (prevTabs.length <= 1) {
        toast.error("最後のタブは削除できません");
        return prevTabs;
      }

      const newTabs = prevTabs.filter((tab) => tab.id !== tabId);

      if (activeTabId === tabId) {
        const newActiveId = newTabs[0]?.id || "";
        setActiveTabId(newActiveId);
        saveTabs(newTabs, newActiveId);
      } else {
        saveTabs(newTabs);
      }

      toast.success("タブを削除しました");
      return newTabs;
    });
  };

  // すべてのデータをクリア
  const clearAllData = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.TABS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TAB);

      setTabs([]);
      setActiveTabId("");

      toast.success("すべてのデータをクリアしました");
    } catch (error) {
      console.error("データのクリアに失敗しました:", error);
      toast.error("データのクリアに失敗しました");
    }
  };

  const handleFeedSubmit = async (url: string, targetTabId?: string) => {
    const tabId = targetTabId || activeTabId;
    // アクティブタブを更新
    setTabs((prevTabs) => {
      const newTabs = prevTabs.map((tab) =>
        tab.id === tabId ? { ...tab, isLoading: true, url, data: null } : tab,
      );
      saveTabs(newTabs);
      return newTabs;
    });

    // 読み込み開始のトースト
    const loadingToast = toast.loading("RSS フィードを取得中...", {
      description: "しばらくお待ちください",
    });

    try {
      const response = await fetch("/api/rss", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "フィードの取得に失敗しました");
      }

      // タブのデータを更新
      setTabs((prevTabs) => {
        const updatedTabs = prevTabs.map((tab) =>
          tab.id === tabId
            ? {
                ...tab,
                title: data.feedTitle || "RSS フィード",
                data,
                isLoading: false,
              }
            : tab,
        );
        saveTabs(updatedTabs);
        return updatedTabs;
      });

      // 成功のトースト
      toast.success("RSS フィードを取得しました", {
        id: loadingToast,
        description: `${data.articles.length} 件の記事を取得`,
      });
    } catch (err) {
      // エラー時はローディング状態を解除
      setTabs((prevTabs) => {
        const errorTabs = prevTabs.map((tab) =>
          tab.id === tabId ? { ...tab, isLoading: false } : tab,
        );
        saveTabs(errorTabs);
        return errorTabs;
      });

      // エラーのトースト
      toast.error("エラーが発生しました", {
        id: loadingToast,
        description:
          err instanceof Error ? err.message : "不明なエラーが発生しました",
      });
    }
  };

  // Hydrationエラー回避のため、クライアントサイドでの初期化が完了するまでスケルトン表示
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-muted">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
          {/* ヘッダースケルトン */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>

          {/* タイトルスケルトン */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse"></div>
          </div>

          {/* PC版レイアウトスケルトン */}
          <div className="hidden lg:flex">
            {/* サイドバースケルトン */}
            <div className="w-80 flex-shrink-0">
              <div className="rounded-lg p-4">
                <div className="mb-4">
                  <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse"></div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mt-1 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* メインコンテンツスケルトン */}
            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-3xl">
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4 bg-card rounded-lg border animate-pulse">
                      <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="flex gap-2">
                        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* モバイル版スケルトン */}
          <div className="lg:hidden">
            <div className="flex gap-3 mb-6">
              <div className="flex gap-2 overflow-hidden">
                {[1, 2].map((i) => (
                  <div key={i} className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ))}
              </div>
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-card rounded-lg border animate-pulse">
                  <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="flex gap-2">
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-muted"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {tabs.length > 0 && tabs.some((tab) => tab.data) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllData}
                className="text-muted-foreground hover:text-red-600 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 dark:hover:border-red-800 w-full sm:w-auto transition-all duration-200"
              >
                <Trash2 className="h-4 w-4 mr-2 text-red-500 dark:text-red-400" />
                すべてクリア
              </Button>
            </motion.div>
          )}
          <ThemeToggle />
        </motion.div>

        <motion.header
          className="text-center mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <motion.h1
            className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-clip-text mb-2"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            RSS Reader
          </motion.h1>
          <motion.p
            className="text-muted-foreground text-sm sm:text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            複数の RSS フィードをタブで管理
          </motion.p>
        </motion.header>

        <main>
          {/* モバイル版: タブレイアウト */}
          <div className="lg:hidden">
            {tabs.length > 0 ? (
              <Tabs
                value={activeTabId}
                onValueChange={setActiveTabId}
                className="w-full"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
                  <div className="w-full sm:flex-1 overflow-hidden">
                    <div className="overflow-x-auto scrollbar-hide">
                      <TabsList className="w-max min-w-full sm:w-fit">
                        {tabs.map((tab) => (
                          <div key={tab.id} className="relative">
                            <TabsTrigger
                              value={tab.id}
                              className="flex items-center gap-1 min-w-0 max-w-32 sm:max-w-40 pr-6"
                            >
                              <span className="truncate text-xs sm:text-sm">
                                {tab.title}
                              </span>
                            </TabsTrigger>
                            {tabs.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeTab(tab.id);
                                }}
                                className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-destructive/20 rounded-sm p-0.5 flex-shrink-0 z-10"
                              >
                                <X className="h-3 w-3 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors" />
                              </button>
                            )}
                          </div>
                        ))}
                      </TabsList>
                    </div>
                  </div>
                  <Dialog
                    open={showMobileDialog}
                    onOpenChange={setShowMobileDialog}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        <Plus className="h-4 w-4 sm:mr-0 mr-2 text-green-600 dark:text-green-400" />
                        <span className="sm:hidden">新しいタブ</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Rss className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          新しいフィードを追加
                        </DialogTitle>
                      </DialogHeader>
                      <RSSForm
                        onSubmit={handleAddFeedSubmit}
                        isLoading={isAddingFeed}
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                {tabs.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id}>
                    {tab.data && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                      >
                        <ArticleList
                          articles={tab.data.articles}
                          feedTitle={tab.data.feedTitle}
                          faviconUrl={tab.data.faviconUrl}
                        />
                      </motion.div>
                    )}
                    {!tab.data && !tab.isLoading && (
                      <motion.div
                        className="text-center text-muted-foreground py-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <p className="text-lg mb-2">
                          フィードを追加してください
                        </p>
                        <p className="text-sm">
                          上の「新しいタブ」ボタンでRSSフィードを追加できます
                        </p>
                      </motion.div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <Dialog
                open={showMobileDialog}
                onOpenChange={setShowMobileDialog}
              >
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    RSSフィードを追加して始めましょう
                  </p>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="inline-flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
                      新しいフィードを追加
                    </Button>
                  </DialogTrigger>
                </div>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Rss className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      新しいフィードを追加
                    </DialogTitle>
                  </DialogHeader>
                  <RSSForm
                    onSubmit={handleAddFeedSubmit}
                    isLoading={isAddingFeed}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* PC版: サイドバーレイアウト */}
          <div className="hidden lg:flex">
            {/* 左サイドバー */}
            <motion.div
              className="w-80 flex-shrink-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="rounded-lg p-4 sticky top-4 backdrop-blur-sm">
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Rss className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    新しいフィード
                  </h3>
                  <RSSForm
                    onSubmit={handleAddFeedSubmit}
                    isLoading={isAddingFeed}
                  />
                </div>

                {tabs.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <List className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      フィード一覧
                    </h3>
                    <div className="space-y-2">
                      {tabs.map((tab) => (
                        <motion.div
                          key={tab.id}
                          className={`p-3 rounded-md cursor-pointer transition-all duration-200 ${
                            activeTabId === tab.id
                              ? "bg-card border border-blue-300 dark:border-blue-700 shadow-md"
                              : "bg-card/50 border hover:bg-card hover:border-blue-200 dark:hover:border-blue-800"
                          }`}
                          onClick={() => {
                            setActiveTabId(tab.id);
                            localStorage.setItem(
                              STORAGE_KEYS.ACTIVE_TAB,
                              tab.id,
                            );
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {tab.data?.faviconUrl && (
                                <div className="w-4 h-4 rounded-sm flex-shrink-0 overflow-hidden">
                                  <img
                                    src={tab.data.faviconUrl}
                                    alt="サイトロゴ"
                                    width={16}
                                    height={16}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                </div>
                              )}
                              <span className="text-sm font-medium truncate">
                                {tab.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFeedSubmit(tab.url, tab.id);
                                }}
                                className="hover:bg-blue-100/80 dark:hover:bg-blue-900/40 rounded-sm p-1 flex-shrink-0 transition-colors"
                                title="フィードを更新"
                              >
                                <RefreshCw className="h-3 w-3 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors" />
                              </button>
                              {tabs.length > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeTab(tab.id);
                                  }}
                                  className="hover:bg-destructive/20 rounded-sm p-1 flex-shrink-0"
                                  title="タブを削除"
                                >
                                  <X className="h-3 w-3 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors" />
                                </button>
                              )}
                            </div>
                          </div>
                          {tab.data && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {tab.data.articles.length} 件の記事
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* メインコンテンツ - 記事リストのみを中央配置 */}
            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-3xl">
                {tabs.length === 0 ? (
                  <motion.div
                    className="text-center text-muted-foreground py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className="text-lg mb-2">
                      RSSフィードを追加して始めましょう
                    </p>
                    <p className="text-sm">
                      左のサイドバーから新しいRSSフィードを追加できます
                    </p>
                  </motion.div>
                ) : tabs.find((tab) => tab.id === activeTabId)?.data ? (
                  <motion.div
                    key={activeTabId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ArticleList
                      articles={
                        tabs.find((tab) => tab.id === activeTabId)?.data
                          ?.articles || []
                      }
                      feedTitle={
                        tabs.find((tab) => tab.id === activeTabId)?.data
                          ?.feedTitle || ""
                      }
                      faviconUrl={
                        tabs.find((tab) => tab.id === activeTabId)?.data
                          ?.faviconUrl
                      }
                    />
                  </motion.div>
                ) : !tabs.find((tab) => tab.id === activeTabId)?.isLoading ? (
                  <motion.div
                    className="text-center text-muted-foreground py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className="text-lg mb-2">フィードを追加してください</p>
                    <p className="text-sm">
                      左のサイドバーから新しいRSSフィードを追加できます
                    </p>
                  </motion.div>
                ) : null}
              </div>
            </div>
          </div>
        </main>
      </div>
    </motion.div>
  );
}
