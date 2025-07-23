import React, { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import ImageTool from '@editorjs/image';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Paragraph from '@editorjs/paragraph';
import LinkTool from '@editorjs/link';
import Marker from '@editorjs/marker';
import Checklist from '@editorjs/checklist';
import Delimiter from '@editorjs/delimiter';
import Warning from '@editorjs/warning';
import CodeTool from '@editorjs/code';
import Embed from '@editorjs/embed';
import { PhotoIcon, XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const ArticleEditor = ({ value, onChange, title, setTitle, coverImage, setCoverImage }) => {
  const ejInstance = useRef();
  const editorRef = useRef();
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (!editorRef.current) return;
    ejInstance.current = new EditorJS({
      holder: editorRef.current,
      data: value,
      autofocus: true,
      placeholder: 'Commencez à écrire votre article...',
      tools: {
        header: {
          class: Header,
          config: {
            placeholder: 'Entrez le titre...',
            levels: [1, 2, 3, 4, 5, 6],
            defaultLevel: 2
          }
        },
        image: {
          class: ImageTool,
          config: {
            uploader: {
              async uploadByFile(file) {
                // Pour la démo, on encode en base64
                return new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => {
                    resolve({ success: 1, file: { url: reader.result } });
                  };
                  reader.onerror = reject;
                  reader.readAsDataURL(file);
                });
              },
            },
            captionPlaceholder: 'Légende de l\'image (optionnel)',
          },
        },
        list: {
          class: List,
          inlineToolbar: true,
          config: {
            defaultStyle: 'unordered'
          }
        },
        quote: {
          class: Quote,
          config: {
            quotePlaceholder: 'Entrez une citation...',
            captionPlaceholder: 'Auteur de la citation',
          }
        },
        paragraph: {
          class: Paragraph,
          config: {
            placeholder: 'Tapez votre texte ici...',
          }
        },
        linkTool: {
          class: LinkTool,
          config: {
            endpoint: '/api/link-preview', // À implémenter si besoin
          }
        },
        marker: {
          class: Marker,
          shortcut: 'CMD+SHIFT+M'
        },
        checklist: {
          class: Checklist,
          inlineToolbar: true,
        },
        delimiter: Delimiter,
        warning: {
          class: Warning,
          config: {
            titlePlaceholder: 'Titre de l\'avertissement',
            messagePlaceholder: 'Message de l\'avertissement',
          }
        },
        code: {
          class: CodeTool,
          config: {
            placeholder: 'Entrez votre code...',
          }
        },
        embed: {
          class: Embed,
          config: {
            services: {
              youtube: true,
              coub: true,
              vimeo: true,
            }
          }
        },
      },
      onChange: async () => {
        const outputData = await ejInstance.current.save();
        onChange && onChange(outputData);
      },
    });
    return () => {
      if (ejInstance.current && typeof ejInstance.current.destroy === 'function') {
        ejInstance.current.isReady
          .then(() => ejInstance.current.destroy())
          .catch(() => {});
      }
    };
  }, []);

  // Pour l'image de présentation (upload local base64)
  const handleCoverImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setCoverImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setCoverImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Titre de l'article *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="input-field text-xl"
          placeholder="Titre de l'article"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Image de présentation *</label>
        {!coverImage ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Glissez-déposez votre image ici ou cliquez pour sélectionner
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImage}
              className="hidden"
              id="cover-image-upload"
            />
            <label
              htmlFor="cover-image-upload"
              className="btn-primary cursor-pointer inline-flex items-center"
            >
              <PhotoIcon className="h-4 w-4 mr-2" />
              Choisir une image
            </label>
          </div>
        ) : (
          <div className="relative">
            <img
              src={coverImage}
              alt="Cover preview"
              className="w-full h-64 object-cover rounded-lg shadow-lg"
            />
            <button
              onClick={() => setCoverImage('')}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">Contenu de l'article *</label>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <DocumentTextIcon className="h-4 w-4" />
            <span>Éditeur riche avec blocs</span>
          </div>
        </div>
        
        <div className="relative">
          <div 
            id="editorjs" 
            ref={editorRef} 
            className="border-2 border-gray-200 rounded-xl bg-white min-h-[500px] p-6 shadow-sm hover:border-gray-300 transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
            style={{
              '--editor-bg': '#ffffff',
              '--editor-border': '#e5e7eb',
              '--editor-text': '#374151',
              '--editor-placeholder': '#9ca3af',
            }}
          />
          
          {/* Indicateur de statut */}
          <div className="absolute bottom-4 right-4 flex items-center space-x-2 text-xs text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Enregistrement automatique</span>
          </div>
        </div>
        
        {/* Conseils d'écriture */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Conseils d'écriture</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Utilisez les titres (H1, H2, H3) pour structurer votre contenu</li>
            <li>• Ajoutez des images pour illustrer vos propos</li>
            <li>• Utilisez les listes pour organiser vos idées</li>
            <li>• Les citations mettent en valeur les points importants</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditor; 