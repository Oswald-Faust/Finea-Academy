class YouTubeConfig {
  // Configuration de la vidéo principale du concours hebdomadaire
  static const String weeklyContestVideoId = '5sw5TzWn1GU';
  static const String weeklyContestVideoTitle = 'Formation Trading FINEA';
  static const String weeklyContestVideoDescription = 'Découvrez nos conseils d\'investissement et déverrouillez votre premier niveau d\'investisseur';
  static const String weeklyContestThumbnailPath = 'assets/images/mec.jpeg';
  
  // URL complète de la vidéo
  static String get weeklyContestVideoUrl => 'https://www.youtube.com/watch?v=$weeklyContestVideoId';
  
  // URL d'embed pour utilisation dans des iframes (si nécessaire)
  static String get weeklyContestEmbedUrl => 'https://www.youtube.com/embed/$weeklyContestVideoId?si=AiQKhpYRayrpxTPU';
  
  // Configuration des paramètres de l'iframe
  static const Map<String, String> iframeParams = {
    'width': '560',
    'height': '315',
    'title': 'YouTube video player',
    'frameborder': '0',
    'allow': 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    'referrerpolicy': 'strict-origin-when-cross-origin',
    'allowfullscreen': 'true',
  };
  
  // Générer l'iframe HTML complet
  static String get iframeHtml => '''
    <iframe 
      width="${iframeParams['width']}" 
      height="${iframeParams['height']}" 
      src="$weeklyContestEmbedUrl" 
      title="${iframeParams['title']}" 
      frameborder="${iframeParams['frameborder']}" 
      allow="${iframeParams['allow']}" 
      referrerpolicy="${iframeParams['referrerpolicy']}" 
      ${iframeParams['allowfullscreen'] == 'true' ? 'allowfullscreen' : ''}>
    </iframe>
  ''';
}
