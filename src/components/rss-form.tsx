import { motion } from "motion/react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RSSFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  defaultUrl?: string;
}

export function RSSForm({
  onSubmit,
  isLoading,
  defaultUrl = "",
}: RSSFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const url = formData.get("url") as string;
    if (url.trim()) {
      onSubmit(url.trim());
      // フォームをリセット
      formRef.current?.reset();
    }
  };

  return (
    <motion.form
      ref={formRef}
      onSubmit={handleSubmit}
      className="mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex flex-col sm:flex-row gap-2 sm:gap-3"
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Input
          type="url"
          name="url"
          placeholder="RSS フィードの URL を入力"
          className="flex-1 text-sm sm:text-base focus:border-blue-400 focus:ring-blue-200 dark:focus:ring-blue-800"
          defaultValue={defaultUrl}
          required
          disabled={isLoading}
        />
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="w-full sm:w-auto"
        >
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto min-w-20 border-0"
          >
            {isLoading ? "読み込み中..." : "取得"}
          </Button>
        </motion.div>
      </motion.div>
    </motion.form>
  );
}
