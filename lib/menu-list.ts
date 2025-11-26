import {
  Tag,
  Users,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
  LucideIcon
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/component",
          label: "Component",
          icon: LayoutGrid,
          submenus: [
          ]
        }
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "",
          label: "Transaction",
          icon: SquarePen,
          submenus: [            
            {
              href: "/transaction/today",
              label: "Today Transaction"
            },
            {
              href: "/transaction/monthly",
              label: "Weekly Transaction"
            },{
              href: "/transaction/posts",
              label: "Monthly Transaction"
            },
            {
              href: "/transaction/all",
              label: "All Transaction"
            }
          ]
        },
        {
          href: "/categories",
          label: "Categories",
          icon: Bookmark
        },
        {
          href: "/tags",
          label: "Tags",
          icon: Tag
        }
      ]
    },
    {
      groupLabel: "Settings",
      menus: [
        {
          href: "/users",
          label: "Users",
          icon: Users
        },
        {
          href: "/account",
          label: "Account Settings",
          icon: Settings
        }
      ]
    }
  ];
}
