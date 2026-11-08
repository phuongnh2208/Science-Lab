import { useState } from "react";
import {
  ArrowUp,
  BookOpen,
  FileText,
  Globe,
  Home,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Save,
  Users,
  X,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import type { Profile } from "../../types/domain";
import facultyLogo from "../../assets/LOGOKHOA2.png";
import universityLogo from "../../assets/logo trường.png";

export function AppLayout({
  children,
  session,
  profile,
  authLoading,
  profileError,
}: {
  children: ReactNode;
  session: Session | null;
  profile: Profile | null;
  authLoading: boolean;
  profileError: string;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);
  const displayName =
    profile?.full_name ||
    session?.user.user_metadata.full_name ||
    session?.user.email ||
    "Tài khoản";

  async function handlePasswordChange() {
    if (!supabase || newPassword.length < 6) {
      setPasswordMessage("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    setIsUpdatingPassword(true);
    setPasswordMessage("");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsUpdatingPassword(false);
    if (error) {
      setPasswordMessage(`Không thể đổi mật khẩu: ${error.message}`);
      return;
    }
    setNewPassword("");
    setPasswordMessage("Đã đổi mật khẩu thành công.");
  }

  return (
    <>
      <header className="navbar">
        <Link className="brand" to="/" onClick={closeMenu}>
          <div className="brand-mark">SL</div>
          <div>
            <p className="brand-name">ScienceLab</p>
            <p className="brand-caption">
              Hỗ trợ giáo viên Vật lí xây dựng bài giảng
            </p>
          </div>
        </Link>
        <button
          className="mobile-menu-button"
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Mở menu"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav
          className={`main-nav ${isMenuOpen ? "is-open" : ""}`}
          aria-label="Điều hướng chính"
        >
          <NavLink to="/" end onClick={closeMenu}>
            <Home size={16} /> Trang chủ
          </NavLink>
          <NavLink to="/lessons" onClick={closeMenu}>
            <BookOpen size={16} /> Bài học
          </NavLink>
          {session && (
            <NavLink to="/classes" onClick={closeMenu}>
              <Users size={16} /> Hồ sơ lớp
            </NavLink>
          )}
          {session && (
            <NavLink to="/lesson-plans" onClick={closeMenu}>
              <FileText size={16} /> Kho KHBD
            </NavLink>
          )}
          {profile?.role === "ADMIN" && (
            <NavLink to="/admin" onClick={closeMenu}>
              <Save size={16} /> Quản trị
            </NavLink>
          )}
        </nav>
        <div className="navbar-actions">
          {session ? (
            <>
              <div
                className={`account-menu ${isAccountOpen ? "is-open" : ""}`}
                onMouseEnter={() => setIsAccountOpen(true)}
                onMouseLeave={() => setIsAccountOpen(false)}
              >
                <button
                  className="account-trigger"
                  type="button"
                  onClick={() => setIsAccountOpen((current) => !current)}
                  aria-expanded={isAccountOpen}
                >
                  <span>Xin chào, {displayName}</span>
                </button>
                {isAccountOpen && (
                  <div className="account-popover">
                    <strong>{displayName}</strong>
                    <small>{session.user.email}</small>
                    <button
                      className="account-action"
                      type="button"
                      onClick={() => {
                        setIsPasswordOpen((current) => !current);
                        setPasswordMessage("");
                      }}
                    >
                      Đổi mật khẩu
                    </button>
                    {isPasswordOpen && (
                      <div className="password-form">
                        <label>
                          Mật khẩu mới
                          <input
                            type="password"
                            minLength={6}
                            value={newPassword}
                            onChange={(event) =>
                              setNewPassword(event.target.value)
                            }
                            placeholder="Tối thiểu 6 ký tự"
                          />
                        </label>
                        {passwordMessage && (
                          <span
                            className={
                              passwordMessage.startsWith("Đã")
                                ? "password-success"
                                : "password-error"
                            }
                          >
                            {passwordMessage}
                          </span>
                        )}
                        <button
                          className="primary-button"
                          type="button"
                          disabled={isUpdatingPassword}
                          onClick={() => void handlePasswordChange()}
                        >
                          {isUpdatingPassword ? "Đang lưu..." : "Lưu mật khẩu"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                className="text-button logout-button"
                type="button"
                onClick={() => void supabase?.auth.signOut()}
              >
                <LogOut size={16} /> Đăng xuất
              </button>
            </>
          ) : (
            <Link className="text-button login-link" to="/login">
              <LogOut size={16} /> Đăng nhập
            </Link>
          )}
        </div>
      </header>
      <main className="app-shell">
        <div className="app-body">
          <div className="app-main">
            {profileError && (
              <p className="error-message profile-error">{profileError}</p>
            )}
            {authLoading && (
              <p className="empty-message profile-error">
                Đang xác thực tài khoản...
              </p>
            )}
            {children}
          </div>
        </div>
      </main>
      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="footer-brand">
            <div
              className="footer-logos"
              aria-label="Logo Trường Đại học Sư phạm Hà Nội và Khoa Vật lí"
            >
              <img className="footer-logo footer-logo-school" src={universityLogo} alt="Logo Trường Đại học Sư phạm Hà Nội" />
              <img className="footer-logo footer-logo-physics" src={facultyLogo} alt="Logo Khoa Vật lí" />
            </div>
            <h2>ScienceLab</h2>
            <strong>
              Phát triển bởi Khoa Vật lí, Trường Đại học Sư phạm Hà Nội
            </strong>
            <p>
              Trợ lý số hỗ trợ giáo viên Vật lí soạn bài, tổ chức thí nghiệm,
              khai thác mô phỏng và xây dựng kế hoạch bài dạy.
            </p>
          </div>
          <div className="footer-contact">
            <h3>THÔNG TIN LIÊN HỆ</h3>
            <a href="https://phys.hnue.edu.vn" target="_blank" rel="noreferrer">
              <Globe size={16} /> phys.hnue.edu.vn
            </a>
            <a href="mailto:bcn.vatli@hnue.edu.vn">
              <Mail size={16} /> bcn.vatli@hnue.edu.vn
            </a>
          </div>
          <div className="footer-meta">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Quay lại đầu trang <ArrowUp size={16} />
            </button>
            <span>
              <MapPin size={15} /> Khoa Vật lí · Trường Đại học Sư phạm Hà Nội
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
