import GitHub from "../../assets/social_media_icons/github.svg";
import Instagram from "../../assets/social_media_icons/instagram.svg";
import LinkedIn from "../../assets/social_media_icons/linkedin.svg";

function Footer() {
  return (
    <footer className="footer p-4 bg-base-300">
      <div className="container mx-auto flex flex-col lg:flex-row justify-between items-center lg:gap-0 gap-2">
        {/* COPYRIGHT */}
        <p className="order-2 lg:order-1">
          Copyright © {new Date().getFullYear()} - Job<span className="text-primary">Trace</span>
        </p>

        {/* SOCIAL MEDIA LINKS */}
        <div className="order-1 lg:order-2 flex flex-row justify-center items-center gap-2">
          {/* GitHub */}
          <a className="btn btn-circle bg-primary text-white border-none shadow-none" href="https://github.com/fchavonet/full_stack-jobtrace" aria-label="GitHub" target="_blank">
            <img className="h-6" src={GitHub} alt="Logo GitHub" />
          </a>

          {/* Instagram */}
          <a className="btn btn-circle bg-primary text-white border-none shadow-none" href="https://www.instagram.com/pandolowitz/" aria-label="Instagram" target="_blank">
            <img className="h-5" src={Instagram} alt="Logo Instagram" />
          </a>

          {/* LinkedIn */}
          <a className="btn btn-circle bg-primary text-white border-none shadow-none" href="https://www.linkedin.com/in/fchavonet/" aria-label="LinkedIn" target="_blank">
            <img className="h-5 mb-0.5" src={LinkedIn} alt="Logo LinkedIn" />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;