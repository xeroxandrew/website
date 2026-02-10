// Influences accordion + tabs (Books / Movies / Artists)
// Customize the data below.

const INFLUENCES = {
  Books: [
    {
      title: "Norwegian Wood",
      body: [
        "I read this after a relationship ended. It made me think about intimacy, love, and the kinds of choices you make when you're hurting.",
        "“Every time you fall in love it will be because something in the person reminds you of them.”"
      ]
    },
    {
      title: "A Little Life",
      body: [
        "A book about four friends over decades — ambition, trauma, tenderness. The characters felt real enough that the tragedy hit hard.",
        "It’s emblematic of the kind of emotionally honest stories I want to tell."
      ]
    },
    {
      title: "Words Without Music",
      body: [
        "Philip Glass worked odd jobs for 21 years in NYC while supporting a family before making a living from music. He never compromised his creative vision.",
        "That persistence made me realize I just need to full send what I want to make."
      ]
    }
  ],
  Movies: [
    {
      title: "Everything Everywhere All at Once",
      body: [
        "A reminder that your “failed” paths are still real lives you could have lived — and that meaning is something you choose."
      ]
    },
    { title: "Before Sunrise", body: ["Romance as attention. Impermanence as fuel."] },
    { title: "Past Lives", body: ["A mature love triangle that treats everyone with empathy."] }
  ],
  Artists: [
    {
      title: "Hayao Miyazaki",
      body: [
        "In my pantheon of role models, Miyazaki is the god of patience.",
        "Decades of craft before the masterpieces."
      ]
    }
  ]
};

function setActiveTab(cat){
  document.querySelectorAll(".tabs button").forEach(btn => {
    const active = btn.dataset.cat === cat;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
}

function renderList(cat){
  const list = document.getElementById("influencesList");
  if(!list) return;
  list.innerHTML = "";

  (INFLUENCES[cat] || []).forEach((item, idx) => {
    const li = document.createElement("li");
    li.className = "infl-item";

    const btn = document.createElement("button");
    btn.className = "infl-toggle";
    btn.type = "button";
    btn.setAttribute("aria-expanded", "false");

    const tri = document.createElement("span");
    tri.className = "tri";
    tri.textContent = "▶";

    const title = document.createElement("span");
    title.textContent = item.title;

    btn.appendChild(tri);
    btn.appendChild(title);

    const body = document.createElement("div");
    body.className = "infl-body";
    (item.body || []).forEach(t => {
      const p = document.createElement("p");
      p.textContent = t;
      body.appendChild(p);
    });

    btn.addEventListener("click", () => {
      const open = !body.classList.contains("open");
      body.classList.toggle("open", open);
      tri.textContent = open ? "▼" : "▶";
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    li.appendChild(btn);
    li.appendChild(body);
    list.appendChild(li);
  });
}

function initInfluences(){
  const defaultCat = "Books";
  setActiveTab(defaultCat);
  renderList(defaultCat);

  document.querySelectorAll(".tabs button").forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.cat;
      setActiveTab(cat);
      renderList(cat);
    });
  });
}

document.addEventListener("DOMContentLoaded", initInfluences);
