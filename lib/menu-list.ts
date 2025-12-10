import {
  Users,
  Settings,
  Tag,
  SquarePen,
  LayoutGrid,
  LucideIcon,
  ShoppingCart,
  Handshake,
  Logs
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
              href: "/transaction/weekly",
              label: "Weekly Transaction"
            },{
              href: "/transaction/monthly",
              label: "Monthly Transaction"
            },
            {
              href: "/transaction/all",
              label: "All Transaction"
            }
          ]
        },
        {
          href: "/retail/all",
          label: "Retail",
          icon: Tag
        },
        {
          href: "/customer/all",
          label: "Customer",
          icon: Handshake
        },
        {
          href: "/supplier/all",
          label: "Suppliers",
          icon: ShoppingCart
        },
        ,
        {
          href: "/audit",
          label: "Audit Log",
          icon: Logs
        },
      ]
    },
    {
      groupLabel: "Settings",
      menus: [
        {
          href: "/users",
          label: "Users Info",
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
