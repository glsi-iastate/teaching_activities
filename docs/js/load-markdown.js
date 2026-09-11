

document.addEventListener("DOMContentLoaded", async () => {
    const containers = document.querySelectorAll("[data-md]");

    for (const container of containers) {
    const markdownFile = container.dataset.md;

    try {
        const response = await fetch(markdownFile);

        if (!response.ok) {
        throw new Error(`Could not load ${markdownFile}: ${response.status}`);
        }

        const markdown = await response.text();

        // Render Markdown first.
        container.innerHTML = marked.parse(markdown);

        // Then find and render $$ ... $$ / \( ... \) math in this container.
        await MathJax.typesetPromise([container]);
    } catch (error) {
        console.error(error);
        container.textContent = `Failed to load documentation: ${error.message}`;
    }
    }
});