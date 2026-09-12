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

  const projects = [
    {
      title: "Product Website",
      description:
        "A modern project showcasing responsive UI and interactive components built with HTML, CSS, and JavaScript.",
      image: "lathrix.png",
      github: "https://github.com/parth-kadiya/lathrix",
      demo: "https://parth-kadiya.github.io/lathrix",
    },
    {
      title: "Personal Website",
      description:
        "Portfolio and spiritual guru profile with appointment booking and services.",
      image: "karnav_shashtri.png",
      github: "https://github.com/parth-kadiya/dr-karnav-shashtri",
      demo: "https://parth-kadiya.github.io/dr-karnav-shashtri",
    },
    
    {
      title: "Patient Testimonials",
      description:
        "A testimonials showcase webpage with animations and modern styling.",
      image: "patient_testimonials.png",
      github: "https://github.com/parth-kadiya/patient-testimonials",
      demo: "https://parth-kadiya.github.io/patient-testimonials",
    },
    {
      title: "Patient Testimonials Two",
      description:
        "Enhanced testimonials section with improved animations and layout.",
      image: "patient_testimonials_two.png",
      github: "https://github.com/parth-kadiya/patient-testimonials-two",
      demo: "https://parth-kadiya.github.io/patient-testimonials-two",
    },
    {
      title: "Doctor Website",
      description:
        "Complete doctor website with treatments, timings, testimonials and forms.",
      image: "doctor_one.png",
      github: "https://github.com/parth-kadiya/sample-doctor-website",
      demo: "https://parth-kadiya.github.io/sample-doctor-website",
    },
    {
      title: "Doctor Website Two",
      description:
        "Doctor profile sample with clean UI and medical service highlights.",
      image: "doctor_two.png",
      github: "https://github.com/parth-kadiya/second-sample-doctor",
      demo: "https://parth-kadiya.github.io/second-sample-doctor",
    },
    {
      title: "Doctor Website Three",
      description:
        "Doctor portfolio template with smooth animations and responsive sections.",
      image: "doctor_three.png",
      github: "https://github.com/parth-kadiya/third-sample-doctor",
      demo: "https://parth-kadiya.github.io/third-sample-doctor",
    },
    {
      title: "Doctor Website Four",
      description:
        "Doctor profile layout with mobile-friendly design and testimonials.",
      image: "doctor_four.png",
      github: "https://github.com/parth-kadiya/fourth-sample-doctor",
      demo: "https://parth-kadiya.github.io/fourth-sample-doctor",
    },
    {
      title: "Doctor Website Five",
      description:
        "Doctor template focused on patient interaction and easy navigation.",
      image: "doctor_five.png",
      github: "https://github.com/parth-kadiya/fifth-sample-doctor",
      demo: "https://github.com/parth-kadiya/fifth-sample-doctor/",
    },
    {
      title: "Independence Day India Map",
      description:
        "Creative Independence Day themed website featuring India map highlights.",
      image: "independence.png",
      github: "https://github.com/parth-kadiya/independence-day-india-map",
      demo: "https://parth-kadiya.github.io/independence-day-india-map",
    },
    {
      title: "Doctor Category",
      description:
        "Healthcare website for categorizing doctors and services with user-friendly UI.",
      image: "doctor_category.png",
      github: "https://github.com/parth-kadiya/doctor-category",
      demo: "https://parth-kadiya.github.io/doctor-category",
    },
    {
      title: "Doctor Category Two",
      description:
        "Doctor listing website with interactive UI for healthcare services.",
      image: "doctor_category_two.png",
      github: "https://github.com/parth-kadiya/doctor-category-two",
      demo: "https://parth-kadiya.github.io/doctor-category-two",
    },
    {
      title: "Kofol Product",
      description:
        "Product landing page for Kofol medicine with clean and responsive design.",
      image: "kofol.png",
      github: "https://github.com/parth-kadiya/kofol",
      demo: "https://parth-kadiya.github.io/kofol",
    },
    {
      title: "Himalaya",
      description:
        "Branded webpage for Himalaya products with attractive visuals and sections.",
      image: "himalaya.png",
      github: "https://github.com/parth-kadiya/Himalaya",
      demo: "https://parth-kadiya.github.io/Himalaya",
    },
    {
      title: "SwarnimTouch Services",
      description:
        "Service showcase website with professional sections and animations.",
      image: "swarnimtouch.png",
      github: "https://github.com/parth-kadiya/SwarnimTouch-Services",
      demo: "https://parth-kadiya.github.io/SwarnimTouch-Services",
    },
    {
      title: "Maze Game",
      description:
        "Fun browser-based maze game built with JavaScript and CSS animations.",
      image: "maze.png",
      github: "https://github.com/parth-kadiya/Maze-Game",
      demo: "https://parth-kadiya.github.io/Maze-Game",
    },
    {
      title: "Word Finder Game",
      description:
        "Word puzzle game where users find hidden words. Built using HTML, CSS, and JS.",
      image: "word.png",
      github: "https://github.com/parth-kadiya/Word-Finder-Game",
      demo: "https://parth-kadiya.github.io/Word-Finder-Game",
    },
    {
      title: "Logo Game",
      description:
        "Interactive logo guessing game testing brand recognition skills.",
      image: "swarnimtouch.png",
      github: "https://github.com/parth-kadiya/Logo-Game",
      demo: "https://parth-kadiya.github.io/Logo-Game",
    },
    {
      title: "BSV",
      description: "A simple project highlighting BSV theme with styled UI.",
      image: "bsv.png",
      github: "https://github.com/parth-kadiya/BSV",
      demo: "https://parth-kadiya.github.io/BSV",
    },
    {
      title: "15th August",
      description:
        "Independence Day webpage with photo upload and patriotic certificate.",
      image: "15thaug.png",
      github: "https://github.com/parth-kadiya/15th-August",
      demo: "https://parth-kadiya.github.io/15th-August",
    },
  ];

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

      {/* grid will handle any number of projects */}
      <div className="projects-grid" role="list">
        {projects.map((project, index) => {
          const imgSrc = project.image && project.image.startsWith("http")
            ? project.image
            : `${process.env.PUBLIC_URL}/assets/${project.image}`;

          const hasWebP = project.image && !project.image.startsWith("http") && !["kofol.png", "word.png", "swarnimtouch.png", "Image 2.jpg"].includes(project.image);
          const webpSrc = hasWebP
            ? `${process.env.PUBLIC_URL}/assets/${project.image.replace(/\.(png|jpe?g)$/i, '.webp')}`
            : null;

          const placeholder = `${process.env.PUBLIC_URL}/assets/placeholder.png`;

          return (
            <article
              className="project-card"
              key={`${project.title}-${index}`}
              role="listitem"
            >
              <div className="project-icon" aria-hidden="true">
                <div className="project-icon-inner">
                  <picture style={{ display: 'contents' }}>
                    {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
                    <img
                      src={imgSrc}
                      alt={project.title + " preview"}
                      width="140"
                      height="140"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        if (e.currentTarget.src !== placeholder) {
                          e.currentTarget.src = placeholder;
                        }
                      }}
                    />
                  </picture>
                </div>
              </div>
              <div className="project-content">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="project-links">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="github-btn"
                    aria-label={`Open ${project.title} GitHub`}
                  >
                    <span>GitHub</span>
                  </a>
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="live-btn"
                    aria-label={`Open ${project.title} Live Demo`}
                  >
                    <span>Live Demo</span>
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
