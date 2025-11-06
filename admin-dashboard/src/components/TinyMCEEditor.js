import React, { useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

const RichTextEditor = ({ 
  value, 
  onChange, 
  title, 
  setTitle, 
  coverImage, 
  setCoverImage 
}) => {
  const quillRef = useRef(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleCoverImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setCoverImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Fonction pour configurer l'upload d'images
  const setupImageUpload = (quill) => {
    const toolbar = quill.getModule('toolbar');
    
    // Remplacer le gestionnaire d'images par défaut
    toolbar.addHandler('image', () => {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.click();

      input.onchange = async () => {
        const file = input.files[0];
        if (file) {
          // Vérifier la taille du fichier (max 10MB)
          if (file.size > 10 * 1024 * 1024) {
            alert('Le fichier est trop volumineux. Taille maximum : 10MB');
            return;
          }

          setIsUploadingImage(true);
          const formData = new FormData();
          formData.append('image', file);
          
          try {
            console.log('📤 Upload de l\'image en cours...', file.name);
            
            const response = await fetch('http://localhost:5001/api/newsletters/upload-image', {
              method: 'POST',
              body: formData,
            });
            
            const result = await response.json();
            console.log('📥 Réponse upload:', result);
            
            if (result.success === 1 && result.file && result.file.url) {
              const range = quill.getSelection();
              quill.insertEmbed(range.index, 'image', result.file.url);
              quill.setSelection(range.index + 1);
              console.log('✅ Image insérée avec succès:', result.file.url);
            } else {
              console.error('❌ Erreur lors de l\'upload de l\'image:', result);
              alert('Erreur lors de l\'upload de l\'image');
            }
          } catch (error) {
            console.error('❌ Erreur upload image:', error);
            alert('Erreur lors de l\'upload de l\'image');
          } finally {
            setIsUploadingImage(false);
          }
        }
      };
    });
  };

  // Configuration des modules Quill
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background',
    'align', 'code-block'
  ];

  return (
    <div className="space-y-6">
      {/* Titre de l'article */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titre de l'article *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 text-lg font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Entrez un titre accrocheur..."
          required
        />
      </div>

      {/* Image de couverture */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image de couverture *
        </label>
        {!coverImage ? (
          <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors bg-gray-50 hover:bg-blue-50">
            <div className="space-y-3 text-center">
              <PhotoIcon className="mx-auto h-16 w-16 text-gray-400" />
              <div className="text-sm text-gray-600">
                <label
                  htmlFor="cover-image-upload"
                  className="relative cursor-pointer rounded-md font-semibold text-blue-600 hover:text-blue-500 focus-within:outline-none"
                >
                  <span>Télécharger une image</span>
                  <input
                    id="cover-image-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleCoverImage}
                  />
                </label>
                <p className="pl-1 inline">ou glisser-déposer</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 10MB</p>
            </div>
          </div>
        ) : (
          <div className="relative rounded-lg overflow-hidden shadow-lg group">
            <img
              src={coverImage}
              alt="Cover preview"
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
              <button
                onClick={() => setCoverImage('')}
                className="opacity-0 group-hover:opacity-100 p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all transform hover:scale-110"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Éditeur Quill.js */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contenu de l'article *
        </label>
        <div className="border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm hover:border-gray-300 transition-colors">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value || ''}
            onChange={onChange}
            modules={modules}
            formats={formats}
            placeholder="Commencez à écrire votre article..."
            style={{
              height: '400px',
              backgroundColor: 'white'
            }}
            onReady={(quill) => {
              setupImageUpload(quill);
            }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            ✨ Éditeur moderne avec formatage avancé, images, liens et plus !
          </p>
          {isUploadingImage && (
            <div className="flex items-center text-blue-600 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Upload en cours...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;

