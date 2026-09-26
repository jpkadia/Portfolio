import React, { useEffect, useMemo, useState } from "react";
import "./Projects.css";
import "./Projects_m.css";
import useScrollAnimation from "../hooks/useScrollAnimation";
import "../styles/ScrollAnimation.css";
import CardCarousel from "./CardCarousel";

const ALL_PROJECTS = [
  // 1. Full-Stack Web Application
  {
    title: "Diwali Video Maker",
    category: "Full-Stack Web Application",
    categoryBadge: "Full-Stack Web App",
    description:
      "Interactive multimedia web application with custom photo cropping, dynamic video rendering, and celebratory greeting generation.",
    image: "diwali_video_maker.svg",
    demo: "https://diwali-video-maker.vercel.app",
  },
  {
    title: "Social Zone",
    category: "Full-Stack Web Application",
    categoryBadge: "Full-Stack Web App",
    description:
      "Feature-rich social media platform with interactive posts, real-time social feed, user connections, and responsive interface.",
    image: "socialzone.svg",
    demo: "https://socialzone.vercel.app",
  },
  {
    title: "Doctor Gen AI",
    category: "Full-Stack Web Application",
    categoryBadge: "Full-Stack AI Portal",
    description:
      "AI-powered healthcare portal featuring intelligent medical assistance, patient appointments, and automated report analysis with Express/Render backend.",
    image: "doctor_gen_ai.svg",
    demo: "https://doctor-gen-ai.vercel.app",
  },

  // 2. Cross-Platform Application
  {
    title: "Bondera",
    category: "Cross-Platform Application",
    categoryBadge: "Cross-Platform App",
    operatingSystem: "Android, Web, iOS",
    description:
      "Modern cross-platform mobile and web application built with Expo and React Native, featuring AI-assisted connectivity and smart messaging.",
    image: "bondera-icon.png",
    demo: "https://bondera.vercel.app",
    appDownload:
      "https://expo.dev/accounts/jpkadia9608s-team/projects/jp-kadiya/builds/e1d57cb9-2168-4109-8a43-22ac3dad949f",
  },

  // 3. Frontend Project
  {
    title: "Product Website",
    category: "Frontend Project",
    categoryBadge: "Frontend Project",
    description:
      "A modern product showcase website featuring interactive UI and responsive design for LàThrix hair care products.",
    image: "lathrix.png",
    demo: "https://parth-kadiya.github.io/lathrix",
  },
  {
    title: "Patient Testimonials",
    category: "Frontend Project",
    categoryBadge: "Frontend Project",
    description:
      "A testimonials showcase webpage with animations, patient reviews, and modern responsive styling.",
    image: "patient_testimonials.png",
    demo: "https://parth-kadiya.github.io/patient-testimonials",
  },
  {
    title: "Doctor Website",
    category: "Frontend Project",
    categoryBadge: "Frontend Project",
    description:
      "Complete doctor website with treatments, timings, patient testimonials, and interactive appointment forms.",
    image: "doctor_one.png",
    demo: "https://parth-kadiya.github.io/sample-doctor-website",
  },

  // 4. Game
  {
    title: "Orbit Lander",
    category: "Game",
    categoryBadge: "3D Space Game",
    description:
      "Orbit Lander is a 3D space game where you launch from one planet and land on another. Avoid asteroids, control your speed, and make a safe landing.",
    image: "orbit_lander.svg",
    demo: `${process.env.PUBLIC_URL}/OrbitLanderSetup.exe`,
    isDownload: true,
    downloadName: "OrbitLanderSetup.exe",
  },
];

export default function Projects() {
  const [text, setText] = useState("");
  const fullText = "PROJECTS";

  // Hook kept but REF moved to subtitle so section itself won't be hidden by animation logic
  const [ref, isVisible] = useScrollAnimation();

  useEffect(() => {
    let mounted = true;
    let index = 0;
    let typingTimeout = null;

    const run = () => {
      if (!mounted) return;

      // if subtitle not visible, poll until it becomes visible (pauses typing)
      if (!isVisible) {
        typingTimeout = setTimeout(run, 500);
        return;
      }

      if (index < fullText.length) {
        setText(fullText.slice(0, index + 1));
        index++;
        typingTimeout = setTimeout(run, 150);
      } else {
        // finished — keep visible for 2s, then clear and restart
        typingTimeout = setTimeout(() => {
          if (!mounted) return;
          setText("");
          index = 0;
          run();
        }, 2000);
      }
    };

    run();

    return () => {
      mounted = false;
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [isVisible, fullText]);

  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(
    () => [
      { id: "All", label: "All Projects", count: ALL_PROJECTS.length },
      {
        id: "Full-Stack Web Application",
        label: "Full-Stack Web App",
        count: ALL_PROJECTS.filter((p) => p.category === "Full-Stack Web Application").length,
      },
      {
        id: "Cross-Platform Application",
        label: "Cross-Platform App",
        count: ALL_PROJECTS.filter((p) => p.category === "Cross-Platform Application").length,
      },
      {
        id: "Frontend Project",
        label: "Frontend Projects",
        count: ALL_PROJECTS.filter((p) => p.category === "Frontend Project").length,
      },
      {
        id: "Game",
        label: "Game",
        count: ALL_PROJECTS.filter((p) => p.category === "Game").length,
      },
    ],
    []
  );

  const filteredProjects = useMemo(() => {
    return activeCategory === "All"
      ? ALL_PROJECTS
      : ALL_PROJECTS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <section
      className={`projects-section scroll-animate ${isVisible ? "visible" : ""}`}
      id="projects"
      ref={ref}
      aria-labelledby="projects-title"
    >
      <div className="projects-container section-container">
        <p
          className={`projects-subtitle typing-text ${isVisible ? "subtitle-visible" : ""}`}
          aria-hidden={false}
          aria-label="PROJECTS"
        >
          {text}
        </p>

        <h2 className="projects-title scroll-reveal" id="projects-title">
          What I've Built
        </h2>

        {/* Category Filter Tabs */}
        <div className="project-category-tabs scroll-reveal delay-1" role="tablist" aria-label="Project Categories">
          {categories.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={activeCategory === cat.id}
              className={`category-tab-btn ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span>{cat.label}</span>
              <span className="category-tab-badge">{cat.count}</span>
            </button>
          ))}
        </div>

        {/* Projects Carousel */}
        <div className="projects-carousel-wrapper scroll-reveal delay-2">
          <CardCarousel
            category={activeCategory}
            items={filteredProjects}
            renderItem={(project, index) => {
              const imgSrc =
                project.image && project.image.startsWith("http")
                  ? project.image
                  : `${process.env.PUBLIC_URL}/assets/${project.image}`;

              const webpImages = ["doctor_one.png", "lathrix.png", "patient_testimonials.png"];
              const hasWebP = webpImages.includes(project.image);

              const webpSrc = hasWebP
                ? `${process.env.PUBLIC_URL}/assets/${project.image.replace(/\.(png|jpe?g)$/i, ".webp")}`
                : null;

              return (
                <article
                  className="project-card"
                  key={`${project.title}-${index}`}
                  itemScope
                  itemType="https://schema.org/SoftwareApplication"
                >
                  <meta itemProp="name" content={project.title} />
                  <meta itemProp="author" content="Parth Kadiya" />
                  <meta itemProp="applicationCategory" content={project.category} />
                  <meta itemProp="url" content={project.demo} />
                  {project.operatingSystem && (
                    <meta itemProp="operatingSystem" content={project.operatingSystem} />
                  )}
                  {project.appDownload && (
                    <meta itemProp="downloadUrl" content={project.appDownload} />
                  )}
                  <div className="project-card-header">
                    <span className="project-card-badge">{project.categoryBadge}</span>
                  </div>

                  <div className="project-icon">
                    <div className="project-icon-inner">
                      <picture style={{ display: "contents" }}>
                        {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
                        <img
                          src={imgSrc}
                          alt={`${project.title} - Project by Parth Kadiya`}
                          width="140"
                          height="140"
                          loading="lazy"
                          decoding="async"
                        />
                      </picture>
                    </div>
                  </div>
                  <div className="project-content">
                    <h3 itemProp="headline">{project.title}</h3>
                    <p itemProp="description">{project.description}</p>
                    <div className="project-links">
                      {project.demo && (
                        <a
                          href={project.demo}
                          {...(project.isDownload
                            ? { download: project.downloadName || "OrbitLanderSetup.exe" }
                            : { target: "_blank", rel: "noopener noreferrer" })}
                          className="live-btn"
                          aria-label={
                            project.isDownload
                              ? `Download ${project.title} by Parth Kadiya`
                              : `Open ${project.title} Live Demo by Parth Kadiya`
                          }
                        >
                          <span>{project.isDownload ? "Download Game" : "Live Demo"}</span>
                        </a>
                      )}
                      {project.appDownload && (
                        <a
                          href={project.appDownload}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="app-download-btn"
                          aria-label={`Download ${project.title} Android App build by Parth Kadiya`}
                        >
                          <span>
                            <i className="fa-brands fa-android" aria-hidden="true" style={{ marginRight: "6px" }} />
                            Download App
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            }}
          />
        </div>
      </div>
    </section>
  );
}
