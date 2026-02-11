"use client"

import { useTheme } from "next-themes"

import { Monitor, Moon, Sun } from "@/components/icons"

import "./styles.css"

import { cx } from "@/tools/cx"
import { useIsMounted } from "@/tools/use-is-mounted"

const THEMES = ["light", "dark", "system"] as const

const THEME_TO_ICON = {
  system: Monitor,
  light: Sun,
  dark: Moon,
}

const THEME_TO_LABEL = {
  system: "System theme",
  light: "Light theme",
  dark: "Dark theme",
}

function normalizeTheme(theme: string): string {
  if (theme === "system" && "matchMedia" in window) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }

  return theme
}

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme = "system", setTheme } = useTheme()
  const isMounted = useIsMounted()

  return (
    <div className={cx("inline-flex items-center gap-0.5 rounded-full border", className)}>
      {THEMES.map((variant) => {
        const Icon = THEME_TO_ICON[variant]

        return (
          <label
            key={variant}
            className="transform-content size-6.5 cursor-pointer rounded-full p-1.5 text-fd-muted-foreground outline-none hover:bg-fd-accent has-checked:bg-fd-accent has-checked:text-fd-accent-foreground has-focus-visible:ring-2 has-focus-visible:ring-fd-ring"
          >
            <input
              aria-label={THEME_TO_LABEL[variant]}
              type="radio"
              className="absolute -z-1 opacity-0"
              name="theme"
              checked={isMounted && theme === variant}
              onChange={({ target }) => {
                const { x, y, width, height } = target.getBoundingClientRect()

                document.documentElement.style.setProperty("--theme-toggle-x", `${x + width / 2}px`)
                document.documentElement.style.setProperty(
                  "--theme-toggle-y",
                  `${y + height / 2}px`,
                )
                if (
                  normalizeTheme(theme) !== normalizeTheme(variant) &&
                  "startViewTransition" in document
                ) {
                  document.startViewTransition(() => setTheme(variant))
                } else {
                  setTheme(variant)
                }
              }}
            />
            <Icon className="size-full" />
          </label>
        )
      })}
    </div>
  )
}
