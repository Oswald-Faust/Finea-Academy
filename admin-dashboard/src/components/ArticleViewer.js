import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ArticleViewer = ({ article, onClose }) => {
  if (!article) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Aperçu de l'article</h2>
            <p className="text-sm text-gray-500 mt-1">
              {article.status === 'published' ? 'Publié' : 'Brouillon'} • 
              {new Date(article.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {/* Image de présentation */}
          {article.coverImage && (
            <div className="mb-6">
              <img
                src={article.coverImage}
                alt="Image de présentation"
                className="w-full h-64 object-cover rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Titre */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          {/* Métadonnées */}
          <div className="flex items-center space-x-4 mb-6 text-sm text-gray-500">
            <span>Auteur: {article.createdBy?.firstName} {article.createdBy?.lastName}</span>
            <span>•</span>
            <span>Type: {article.type}</span>
            {article.tags && article.tags.length > 0 && (
              <>
                <span>•</span>
                <span>Tags: {article.tags.join(', ')}</span>
              </>
            )}
          </div>

          {/* Contenu */}
          <div className="prose max-w-none">
            {article.content && typeof article.content === 'object' ? (
              <div className="space-y-4">
                {article.content.blocks?.map((block, index) => (
                  <div key={index} className="mb-4">
                    {block.type === 'header' && (
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {block.data?.text}
                      </h2>
                    )}
                    {block.type === 'paragraph' && (
                      <p className="text-gray-700 leading-relaxed">
                        {block.data?.text}
                      </p>
                    )}
                    {block.type === 'list' && (
                      <ul className="list-disc list-inside space-y-1">
                        {block.data?.items?.map((item, itemIndex) => (
                          <li key={itemIndex} className="text-gray-700">
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                    {block.type === 'image' && (
                      <div className="my-4">
                        <img
                          src={block.data?.url}
                          alt={block.data?.caption || 'Image'}
                          className="max-w-full h-auto rounded-lg shadow-md"
                        />
                        {block.data?.caption && (
                          <p className="text-sm text-gray-500 mt-2 text-center">
                            {block.data.caption}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-700 leading-relaxed">
                {typeof article.content === 'string' ? article.content : 'Contenu non disponible'}
              </div>
            )}
          </div>

          {/* Statut */}
          <div className="mt-8 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  article.status === 'published' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {article.status === 'published' ? 'Publié' : 'Brouillon'}
                </span>
                {article.publishedAt && (
                  <span className="text-sm text-gray-500">
                    Publié le {new Date(article.publishedAt).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleViewer; 