import {
  Code2,
  StickyNote,
  FolderTree,
  Tags,
  Star,
  Trash2,
  LifeBuoy,
} from "lucide-react";

// Pages that are just empty states for now. Replace each with a real page later.
export const placeholderPages = [
  {
    path: "snippets",
    icon: Code2,
    title: "Snippets",
    description: "All the code you've saved.",
    emptyTitle: "No snippets yet",
    emptyText: "Snippets you save will show up here.",
  },
  {
    path: "notes",
    icon: StickyNote,
    title: "Notes",
    description: "Your developer notes.",
    emptyTitle: "No notes yet",
    emptyText: "Notes you write will show up here.",
  },
  {
    path: "collections",
    icon: FolderTree,
    title: "Collections",
    description: "Snippets and notes grouped by project.",
    emptyTitle: "No collections yet",
    emptyText: "Create a collection to group related snippets and notes.",
  },
  {
    path: "tags",
    icon: Tags,
    title: "Tags",
    description: "Labels you use to filter your workspace.",
    emptyTitle: "No tags yet",
    emptyText: "Tags you add to snippets and notes will show up here.",
  },
  {
    path: "favorites",
    icon: Star,
    title: "Favorites",
    description: "Quick access to the items you use most.",
    emptyTitle: "No favorites yet",
    emptyText: "Star a snippet or note to keep it here.",
  },
  {
    path: "trash",
    icon: Trash2,
    title: "Trash",
    description: "Deleted items you can still restore.",
    emptyTitle: "Trash is empty",
    emptyText: "Deleted snippets and notes will show up here.",
  },
  {
    path: "help",
    icon: LifeBuoy,
    title: "Help center",
    description: "Guides and answers for using Kodet.",
    emptyTitle: "Help articles are coming soon",
    emptyText: "For now, check the FAQ page or reach out to support.",
  },
];