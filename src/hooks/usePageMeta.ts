import { useEffect } from 'react';

export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title;
    if (description) {
      const el = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (el) el.content = description;
    }
  }, [title, description]);
}
