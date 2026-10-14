import { brand } from "../content";

export default function Story() {
  return (
    <section className="section container" id="story" aria-labelledby="story-title">
      <div className="section-head">
        <h2 id="story-title">{brand.story.title}</h2>
      </div>
      <div className="story-grid">
        {brand.story.items.map((item) => (
          <article className="story-item" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
