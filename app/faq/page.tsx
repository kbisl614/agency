import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Questions | Workfloor",
  description: "Plain answers for HVAC contractors. No tech talk.",
};

const faqs = [
  {
    q: "How does it actually work?",
    a: "You miss a call. We text the customer back in 60 seconds. We ask what's wrong and help get them booked. Same thing at night — leads that come in after hours get a reply in under 30 seconds. And if a job cancels, we text your waiting customers right away to fill the slot. You don't do anything.",
  },
  {
    q: "Do I have to switch my software?",
    a: "No. We plug into Jobber, ServiceTitan, or HouseCall Pro. Your guys keep using what they know. We work in the background. Nothing changes on your end.",
  },
  {
    q: "What if I'm too busy to set this up?",
    a: "We do the setup. All of it. You get on a quick call with us — about 20 minutes — and we handle the rest. We connect to your software, set up the messaging, and test everything before it goes live.",
  },
  {
    q: "How do you know what to say to my customers?",
    a: "We learn your business before we touch anything. The messages sound like they came from your office — not a robot. You read them and approve before we go live. If you don't like the tone, we change it.",
  },
  {
    q: "What happens during the free trial?",
    a: "We set it all up for free. For 30 days it runs and we track every call caught, every lead answered, every open slot filled. If we don't get you at least 5 new leads and fill 2 open jobs, your first month is free. Zero risk.",
  },
  {
    q: "What does $1,500 a month get me?",
    a: "Every missed call gets a text back. Every after-hours lead gets answered. Every cancellation gets filled — automatically. No one to hire. No phone tag. Most contractors get back $4,000–$8,600 a month. The math works fast.",
  },
  {
    q: "How soon can you get this running?",
    a: "Most contractors are live within a week. We do a short call, connect to your software, and you're off. No long setup. No training. No headaches.",
  },
  {
    q: "What if the messages say something wrong?",
    a: "You read and approve everything before it goes live. Nothing gets sent to a customer without you seeing it first. And we review how things are going every month so we can fix anything that's off.",
  },
  {
    q: "Why not just hire someone to answer the phone?",
    a: "A good dispatcher runs $38k–$55k a year. They can't work at 2am. They take sick days. They miss calls too. We run around the clock for $1,500/month. Ten recovered calls a month pays for itself.",
  },
  {
    q: "What if I want to quit?",
    a: "Cancel anytime. No contracts. No cancellation fees. Just say the word and we shut it down. That's it.",
  },
];

export default function FAQPage() {
  return (
    <>
      <Header />
      <main style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
        <section style={{ padding: "48px 32px", maxWidth: "640px", margin: "0 auto" }}>
          <div style={{ fontSize: "11px", fontWeight: 500, color: "#E8934A", letterSpacing: "1.4px", textTransform: "uppercase", marginBottom: "8px" }}>
            Questions
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "8px" }}>
            Plain answers. No tech talk.
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "40px" }}>
            If you&apos;re skeptical, good. Here&apos;s what you actually need to know.
          </p>
          <div>
            {faqs.map(({ q, a }) => (
              <div key={q} style={{ borderTop: "0.5px solid var(--border-subtle)", padding: "24px 0" }}>
                <h2 style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "10px" }}>{q}</h2>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7 }}>{a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
