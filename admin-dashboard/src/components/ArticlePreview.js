import React from 'react';

const ArticlePreview = ({ title, coverImage, content }) => {
  // Fonction pour rendre le texte formaté (gras, italique, etc.)
  const renderFormattedText = (text) => {
    if (!text) return '';
    
    // Remplacer les balises HTML par des éléments React
    return text
      .replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>')
      .replace(/<i>(.*?)<\/i>/g, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/<mark>(.*?)<\/mark>/g, '<mark>$1</mark>')
      .split('\n').map((line, index) => (
        <span key={index} dangerouslySetInnerHTML={{ __html: line }} />
      ));
  };

  const renderBlock = (block) => {
    if (!block || !block.data) return null;
    
    switch (block.type) {
      case 'header':
        const HeaderTag = `h${block.data.level}`;
        const headerClasses = {
          1: 'text-4xl font-bold text-gray-900 mb-6 mt-8 leading-tight',
          2: 'text-3xl font-bold text-gray-800 mb-5 mt-7 leading-tight',
          3: 'text-2xl font-semibold text-gray-800 mb-4 mt-6 leading-tight',
          4: 'text-xl font-semibold text-gray-700 mb-3 mt-5 leading-tight',
          5: 'text-lg font-medium text-gray-700 mb-3 mt-4 leading-tight',
          6: 'text-base font-medium text-gray-600 mb-2 mt-3 leading-tight',
        };
        return (
          <HeaderTag key={block.id} className={headerClasses[block.data.level] || headerClasses[1]}>
            {block.data.text || ''}
          </HeaderTag>
        );
      
      case 'paragraph':
        return (
          <p key={block.id} className="mb-6 leading-relaxed text-gray-700 text-lg">
            {renderFormattedText(block.data.text || '')}
          </p>
        );
      
      case 'image':
        if (!block.data.file || !block.data.file.url) return null;
        return (
          <div key={block.id} className="mb-8">
            <img 
              src={block.data.file.url} 
              alt={block.data.caption || 'Image'} 
              className="w-full rounded-lg shadow-lg"
            />
            {block.data.caption && (
              <p className="text-sm text-gray-600 mt-3 text-center italic">{block.data.caption}</p>
            )}
          </div>
        );
      
      case 'list':
        const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
        if (!block.data.items || !Array.isArray(block.data.items)) return null;
        return (
          <ListTag key={block.id} className="mb-6 ml-6 space-y-2">
            {block.data.items.map((item, index) => (
              <li key={index} className="text-gray-700 leading-relaxed">
                {typeof item === 'string' ? renderFormattedText(item) : renderFormattedText(item.text || '')}
              </li>
            ))}
          </ListTag>
        );
      
      case 'quote':
        return (
          <blockquote key={block.id} className="border-l-4 border-blue-500 pl-6 py-4 mb-8 bg-blue-50 rounded-r-lg">
            <p className="italic text-xl text-gray-800 leading-relaxed">
              {renderFormattedText(block.data.text || '')}
            </p>
            {block.data.caption && (
              <cite className="text-sm text-gray-600 mt-2 block">— {block.data.caption}</cite>
            )}
          </blockquote>
        );
      
      case 'code':
        return (
          <div key={block.id} className="mb-8">
            <pre className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto shadow-lg">
              <code className="text-sm">{block.data.code || ''}</code>
            </pre>
          </div>
        );
      
      case 'warning':
        return (
          <div key={block.id} className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-yellow-800">{block.data.title || ''}</h4>
                <p className="text-yellow-700 mt-1 leading-relaxed">
                  {renderFormattedText(block.data.message || '')}
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'checklist':
        if (!block.data.items || !Array.isArray(block.data.items)) return null;
        return (
          <div key={block.id} className="mb-8">
            {block.data.items.map((item, index) => (
              <label key={index} className="flex items-start mb-3">
                <input 
                  type="checkbox" 
                  checked={item.checked || false} 
                  readOnly 
                  className="mt-1 mr-3 h-5 w-5 text-blue-600"
                />
                <span className={`leading-relaxed ${item.checked ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                  {typeof item === 'string' ? renderFormattedText(item) : renderFormattedText(item.text || '')}
                </span>
              </label>
            ))}
          </div>
        );
      
      case 'delimiter':
        return <hr key={block.id} className="my-12 border-gray-300" />;
      
      case 'embed':
        return (
          <div key={block.id} className="mb-8">
            <div className="aspect-w-16 aspect-h-9">
              <iframe 
                src={block.data.embed || ''} 
                frameBorder="0" 
                allowFullScreen 
                className="w-full h-80 rounded-lg shadow-lg"
              />
            </div>
            {block.data.caption && (
              <p className="text-sm text-gray-600 mt-3 text-center italic">{block.data.caption}</p>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Header avec image de présentation */}
      {coverImage && (
        <div className="mb-12">
          <img 
            src={coverImage} 
            alt="Cover" 
            className="w-full h-96 object-cover rounded-xl shadow-2xl"
          />
        </div>
      )}
      
      {/* Titre */}
      {title && (
        <h1 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">
          {title}
        </h1>
      )}
      
      {/* Contenu */}
      <div className="prose prose-lg max-w-none">
        {content && content.blocks && Array.isArray(content.blocks) && 
          content.blocks.map(renderBlock).filter(Boolean)}
      </div>
    </div>
  );
};

export default ArticlePreview; 