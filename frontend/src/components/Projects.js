import React, { useEffect, useState } from "react";
import "./Projects.css";
import "./Projects_m.css";
import useScrollAnimation from "../hooks/useScrollAnimation";
import "../styles/ScrollAnimation.css";

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

  const allProjects = [
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
      title: "SocialZone",
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
      description:
        "Modern cross-platform mobile and web application built with Expo and React Native, featuring AI-assisted connectivity and smart messaging.",
      image: "bondera-icon.png",
      demo: "https://bondera.vercel.app",
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
  ];

  const categories = [
    { id: "All", label: "All Projects", count: allProjects.length },
    {
      id: "Full-Stack Web Application",
      label: "Full-Stack Web App",
      count: allProjects.filter((p) => p.category === "Full-Stack Web Application").length,
    },
    {
      id: "Cross-Platform Application",
      label: "Cross-Platform App",
      count: allProjects.filter((p) => p.category === "Cross-Platform Application").length,
    },
    {
      id: "Frontend Project",
      label: "Frontend Projects",
      count: allProjects.filter((p) => p.category === "Frontend Project").length,
    },
  ];

  const categoryGroups =
    activeCategory === "All"
      ? ["Full-Stack Web Application", "Cross-Platform Application", "Frontend Project"]
      : [activeCategory];

  return (
    <section className="projects-section" id="projects" aria-labelledby="projects-title">
      {/* attach ref to subtitle only — doesn't hide whole section */}
      <p
        ref={ref}
        className={`projects-subtitle typing-text ${isVisible ? "subtitle-visible" : ""}`}
        aria-hidden={false}
        aria-label="PROJECTS"
      >
        {text}
      </p>

      <h2 className="projects-title" id="projects-title">
        What I've Built
      </h2>

      {/* Category Filter Tabs */}
      <div className="project-category-tabs" role="tablist" aria-label="Project Categories">
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

      {/* Categorized Project Groups */}
      <div className="project-groups-wrapper">
        {categoryGroups.map((group) => {
          const groupProjects = allProjects.filter((p) => p.category === group);
          if (groupProjects.length === 0) return null;

          return (
            <div className="project-category-group" key={group}>
              <h3 className="project-group-title">
                <span className="group-title-accent">{group}</span>
                <span className="group-count">({groupProjects.length})</span>
              </h3>

              <div className="projects-grid" role="list">
                {groupProjects.map((project, index) => {
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
                      role="listitem"
                      itemScope
                      itemType="https://schema.org/SoftwareApplication"
                    >
                      <meta itemProp="name" content={project.title} />
                      <meta itemProp="author" content="Parth Kadiya" />
                      <meta itemProp="applicationCategory" content={project.category} />
                      <meta itemProp="url" content={project.demo} />
                      <div className="project-card-header">
                        <span className="project-card-badge">{project.categoryBadge}</span>
                      </div>

                      <div className="project-icon" aria-hidden="true">
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
                          <a
                            href={project.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="live-btn"
                            aria-label={`Open ${project.title} Live Demo by Parth Kadiya`}
                          >
                            <span>Live Demo</span>
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
