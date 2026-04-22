import { useTheme } from "../../context/ThemeContext";
import useWindowWidth from "../../hooks/useWindowWidth";
import { IconSun, IconMoon, IconLogo } from "../Icons";
import "./Sidebar.css";

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const { isDesktop, isMobile } = useWindowWidth();

  if (isDesktop) {
    return (
      <aside className="sidebar">
        <div className="sidebar__logo">
          <div className="sidebar__logo-bottom" />
          <div className="sidebar__logo-icon">
            <IconLogo />
          </div>
        </div>
        <div className="sidebar__bottom">
          <button
            className="sidebar__theme-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <IconSun /> : <IconMoon />}
          </button>
          <div className="sidebar__avatar-wrap">
            <div className="sidebar__avatar" />
          </div>
        </div>
      </aside>
    );
  }

  return (
    <header className={`topbar ${isMobile ? "topbar--mobile" : "topbar--tablet"}`}>
      <div className={`topbar__logo ${isMobile ? "topbar__logo--mobile" : "topbar__logo--tablet"}`}>
        <div className="topbar__logo-bottom" />
        <div className="topbar__logo-icon">
          <IconLogo />
        </div>
      </div>
      <div className="topbar__right">
        <button
          className="topbar__theme-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <IconSun /> : <IconMoon />}
        </button>
        <div className="topbar__avatar-wrap">
          <div className="topbar__avatar" />
        </div>
      </div>
    </header>
  );
}
