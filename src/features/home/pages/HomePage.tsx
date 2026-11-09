import { ArrowRight, BookOpen, ChevronRight, Users } from "lucide-react";
import { Link } from "react-router-dom";
import backgroundImage from "../../../assets/nền.png";
import type { Session } from "@supabase/supabase-js";

export function HomePage({ session }: { session: Session | null }) {
  return (
    <section className="home-page">
      <div className="home-copy">
        <p className="eyebrow">ScienceLab · Vật lí</p>
        <h1>Biến mỗi bài học thành một hành trình khám phá.</h1>
        <p className="hero-description">
          Nền tảng hỗ trợ giáo viên Vật lí chuẩn bị bài giảng, tổ chức thí
          nghiệm và khai thác mô phỏng tương tác.
        </p>
        <div className="home-actions">
          <Link className="primary-button link-button" to="/lessons">
            Khám phá bài học <ArrowRight size={17} />
          </Link>
          {!session && (
            <Link className="secondary-button link-button" to="/login">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
      <div
        className="science-orbit"
        aria-hidden="true"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="home-features">
        <div>
          <BookOpen size={19} />
          <strong>Thư viện bài học</strong>
          <span>Nội dung Vật lí được tuyển chọn</span>
        </div>
        <div>
          <Users size={19} />
          <strong>Cá nhân hóa lớp học</strong>
          <span>Gợi ý theo thiết bị thực tế</span>
        </div>
        <div>
          <ChevronRight size={19} />
          <strong>Soạn KHBD</strong>
          <span>Sẵn sàng cho bước tiếp theo</span>
        </div>
      </div>
    </section>
  );
}
