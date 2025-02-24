export function Content({ id }: { id?: string }) {
  return (
    <div id={id}>
      <h2 className="text-lg font-semibold">Sample Content</h2>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </p>
      <h3>Features List</h3>
      <ul>
        <li>Persistent text selection highlighting</li>
        <li>Multiple selections support</li>
        <li>Works with mixed content</li>
        <li>Easy to use React component</li>
      </ul>

      <p>
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
        dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
        proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <h3>How to Use</h3>
      <ol>
        <li>Click and drag to select text</li>
        <li>Release mouse to persist the selection</li>
        <li>Make multiple selections as needed</li>
      </ol>
    </div>
  );
}
