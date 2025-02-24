import { Content } from './components/content';
import { TextSelectionContainer } from './components/text-selection-container/text-selection-container';
import { useLocalStorage } from 'usehooks-ts';

type Highlight = {
  id: string;
  start: number;
  end: number;
  color: string;
};

function App() {
  const [highlights, setHighlights] = useLocalStorage<Highlight[]>(
    'highlights',
    []
  );

  const handleHighlight = (highlight: Highlight) => {
    setHighlights([...highlights, highlight]);
  };

  const handleDelete = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  const handleDeleteAll = () => {
    setHighlights([]);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
      <h1>Text Selection</h1>
      <p>Try selecting some text below.</p>

      <div className="flex gap-8">
        <div className="flex-1 border border-solid border-gray-200 rounded-lg p-6">
          <TextSelectionContainer 
            containerId="text-selection-container"
            highlights={highlights}
            onHighlight={handleHighlight}
          >
            <Content />
          </TextSelectionContainer>
        </div>

        <div className="flex-1 p-6 ">
          {highlights.length === 0 ? (
            <p className="text-gray-400">No selections yet</p>
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleDeleteAll}
                  className="px-3 py-1 text-sm rounded"
                >
                  Delete All
                </button>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="w-16">Start</th>
                    <th className="w-16">End</th>
                    <th>Color</th>
                    <th className="w-16">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {highlights.map((highlight, index) => (
                    <tr key={highlight.id} className="border-t border-gray-700">
                      <td className="py-2">{highlight.start}</td>
                      <td className="py-2">{highlight.end}</td>
                      <td className="py-2">
                        <div 
                          className="w-6 h-6 rounded" 
                          style={{ backgroundColor: highlight.color }}
                        />
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => handleDelete(index)}
                          className="px-2 py-1 text-sm rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
