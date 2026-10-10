"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type AdminNavigationLink = {
  href: string;
  label: string;
  icon: string;
  permission: string;
};

/**
 * Client-only navigation highlights the route currently being viewed.
 * Permission filtering is performed by the server shell before these links
 * are passed here, so the browser never decides what an administrator may access.
 */
export function AdminNavigation({ links }: { links: AdminNavigationLink[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Administrator navigation" className="admin-nav">
      {links.map((link) => {
        const isActive = link.href === "/admin"
          ? pathname === "/admin"
          : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`admin-nav-link${isActive ? " active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <span aria-hidden="true">{link.icon}</span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
