import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Sets up GSAP ScrollTrigger animations for sections, headings,
 * parallax backgrounds, and floating elements.
 * Call once from the app root after mount.
 */
export const useGsapAnimations = () => {
  useEffect(() => {
    // Wait a tick for DOM
    const ctx = gsap.context(() => {
      // ── Parallax background layers ──
      gsap.utils.toArray<HTMLElement>(".parallax-bg").forEach((el) => {
        const speed = parseFloat(el.dataset.speed || "0.5");
        gsap.to(el, {
          yPercent: -30 * speed,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement || el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      // ── Floating decorative elements ──
      gsap.utils.toArray<HTMLElement>(".float-on-scroll").forEach((el) => {
        gsap.to(el, {
          y: -40,
          rotation: 5,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement || el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });

      // ── GSAP heading letter-by-letter reveal ──
      gsap.utils.toArray<HTMLElement>(".gsap-heading").forEach((heading) => {
        const text = heading.textContent || "";
        heading.innerHTML = "";
        text.split("").forEach((char) => {
          const span = document.createElement("span");
          span.className = "char";
          span.textContent = char === " " ? "\u00A0" : char;
          heading.appendChild(span);
        });

        gsap.to(heading.querySelectorAll(".char"), {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.02,
          ease: "power3.out",
          scrollTrigger: {
            trigger: heading,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      });

      // ── Section parallax depth (background moves slower) ──
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const depth = parseFloat(el.dataset.parallax || "0.3");
        gsap.fromTo(
          el,
          { y: 60 * depth },
          {
            y: -60 * depth,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);
};
