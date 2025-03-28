// 管理所有语言的文本翻译
export const translations = {
  "zh-CN": {
    common: {
      search: "搜索",
      translate: "翻译",
      cancel: "取消",
      save: "保存",
      delete: "删除",
      close: "关闭",
      loading: "加载中...",
      noData: "暂无数据",
      error: "错误",
      retry: "重试",
    },
    settings: {
      title: "设置",
      language: "语言",
      version: "版本",
    },
    search: {
      placeholder: "输入一个单词...",
      viewDetails: "点击查看详情",
      noResults: "未找到结果",
      errorMessage: "搜索失败，请重试",
    },
    wordCard: {
      addToFavorite: "添加到收藏",
      removeFromFavorite: "从收藏中移除",
      noDefinitions: "没有可用的定义",
      noDataFound: "未找到数据",
      addedToFavorites: "已添加到收藏",
      removedFromFavorites: "已从收藏中移除",
    },
    main: {
      upload: "上传",
      takePhoto: "拍照",
      cameraPrompt: '点击"上传"或"拍照"开始识别物体。',
      processing: "处理中...",
    },
    favorites: {
      title: "收藏",
      loading: "加载收藏中...",
      empty: "暂无收藏。",
      deleteTitle: "删除收藏",
      deleteConfirm: '确定要从收藏中移除"{word}"吗？',
      deleteError: "无法删除收藏，请重试。",
    },
    error: {
      noDefinitionFound: "未找到定义。",
      failedToFetchData: "获取单词数据失败。",
      loadWordFailed: "加载单词失败。",
      favoriteOperationFailed: "收藏操作失败。",
    },
    toast: {
      addedToFavorites: "已添加到收藏",
      removedFromFavorites: "已从收藏中移除",
    },
    navigation: {
      home: "首页",
      search: "搜索",
      favorites: "收藏",
      settings: "设置",
    },
  },
  "fr": {
    common: {
      search: "Rechercher",
      translate: "Traduire",
      cancel: "Annuler",
      save: "Enregistrer",
      delete: "Supprimer",
      close: "Fermer",
      loading: "Chargement...",
      noData: "Aucune donnée",
      error: "Erreur",
      retry: "Réessayer",
    },
    settings: {
      title: "Paramètres",
      language: "Langue",
      version: "Version",
    },
    search: {
      placeholder: "Entrez un mot...",
      viewDetails: "Cliquez pour voir les détails",
      noResults: "Aucun résultat trouvé",
      errorMessage: "La recherche a échoué, veuillez réessayer",
    },
    wordCard: {
      addToFavorite: "Ajouter aux favoris",
      removeFromFavorite: "Supprimer des favoris",
      noDefinitions: "Aucune définition disponible",
      noDataFound: "Aucune donnée trouvée",
      addedToFavorites: "Ajouté aux favoris",
      removedFromFavorites: "Supprimé des favoris",
    },
    main: {
      upload: "Télécharger",
      takePhoto: "Prendre une photo",
      cameraPrompt: 'Appuyez sur "Télécharger" ou "Prendre une photo" pour commencer à détecter des objets.',
      processing: "Traitement en cours...",
    },
    favorites: {
      title: "Favoris",
      loading: "Chargement des favoris...",
      empty: "Aucun favori pour le moment.",
      deleteTitle: "Supprimer le favori",
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer "{word}" des favoris ?',
      deleteError: "Impossible de supprimer le favori. Veuillez réessayer.",
    },
    error: {
      noDefinitionFound: "Aucune définition trouvée.",
      failedToFetchData: "Échec de récupération des données de mot.",
      loadWordFailed: "Échec du chargement du mot.",
      favoriteOperationFailed: "Échec de l'opération de favori.",
    },
    toast: {
      addedToFavorites: "Ajouté aux favoris",
      removedFromFavorites: "Supprimé des favoris",
    },
    navigation: {
      home: "Accueil",
      search: "Rechercher",
      favorites: "Favoris",
      settings: "Paramètres",
    },
  },
  "de": {
    common: {
      search: "Suchen",
      translate: "Übersetzen",
      cancel: "Abbrechen",
      save: "Speichern",
      delete: "Löschen",
      close: "Schließen",
      loading: "Wird geladen...",
      noData: "Keine Daten",
      error: "Fehler",
      retry: "Wiederholen",
    },
    settings: {
      title: "Einstellungen",
      language: "Sprache",
      version: "Version",
    },
    search: {
      placeholder: "Geben Sie ein Wort ein...",
      viewDetails: "Klicken Sie, um Details anzuzeigen",
      noResults: "Keine Ergebnisse gefunden",
      errorMessage: "Suche fehlgeschlagen, bitte versuchen Sie es erneut",
    },
    wordCard: {
      addToFavorite: "Zu Favoriten hinzufügen",
      removeFromFavorite: "Aus Favoriten entfernen",
      noDefinitions: "Keine Definitionen verfügbar",
      noDataFound: "Keine Daten gefunden",
      addedToFavorites: "Zu Favoriten hinzugefügt",
      removedFromFavorites: "Aus Favoriten entfernt",
    },
    main: {
      upload: "Hochladen",
      takePhoto: "Foto aufnehmen",
      cameraPrompt: 'Tippen Sie auf "Hochladen" oder "Foto aufnehmen", um mit der Objekterkennung zu beginnen.',
      processing: "Verarbeitung...",
    },
    favorites: {
      title: "Favoriten",
      loading: "Favoriten werden geladen...",
      empty: "Noch keine Favoriten.",
      deleteTitle: "Favorit löschen",
      deleteConfirm: 'Sind Sie sicher, dass Sie "{word}" aus den Favoriten entfernen möchten?',
      deleteError: "Favorit konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.",
    },
    error: {
      noDefinitionFound: "Keine Definition gefunden.",
      failedToFetchData: "Abrufen der Wortdaten fehlgeschlagen.",
      loadWordFailed: "Laden des Wortes fehlgeschlagen.",
      favoriteOperationFailed: "Favoritenoperation fehlgeschlagen.",
    },
    toast: {
      addedToFavorites: "Zu Favoriten hinzugefügt",
      removedFromFavorites: "Aus Favoriten entfernt",
    },
    navigation: {
      home: "Startseite",
      search: "Suchen",
      favorites: "Favoriten",
      settings: "Einstellungen",
    },
  },
  "es": {
    common: {
      search: "Buscar",
      translate: "Traducir",
      cancel: "Cancelar",
      save: "Guardar",
      delete: "Eliminar",
      close: "Cerrar",
      loading: "Cargando...",
      noData: "Sin datos",
      error: "Error",
      retry: "Reintentar",
    },
    settings: {
      title: "Configuración",
      language: "Idioma",
      version: "Versión",
    },
    search: {
      placeholder: "Ingrese una palabra...",
      viewDetails: "Haga clic para ver detalles",
      noResults: "No se encontraron resultados",
      errorMessage: "Búsqueda fallida, inténtelo de nuevo",
    },
    wordCard: {
      addToFavorite: "Añadir a favoritos",
      removeFromFavorite: "Eliminar de favoritos",
      noDefinitions: "No hay definiciones disponibles",
      noDataFound: "No se encontraron datos",
      addedToFavorites: "Añadido a favoritos",
      removedFromFavorites: "Eliminado de favoritos",
    },
    main: {
      upload: "Subir",
      takePhoto: "Tomar foto",
      cameraPrompt: 'Toque "Subir" o "Tomar foto" para comenzar a detectar objetos.',
      processing: "Procesando...",
    },
    favorites: {
      title: "Favoritos",
      loading: "Cargando favoritos...",
      empty: "Aún no hay favoritos.",
      deleteTitle: "Eliminar favorito",
      deleteConfirm: '¿Está seguro de que desea eliminar "{word}" de favoritos?',
      deleteError: "No se pudo eliminar el favorito. Inténtelo de nuevo.",
    },
    error: {
      noDefinitionFound: "No se encontró definición.",
      failedToFetchData: "Error al obtener datos de la palabra.",
      loadWordFailed: "Error al cargar la palabra.",
      favoriteOperationFailed: "Error en la operación de favoritos.",
    },
    toast: {
      addedToFavorites: "Añadido a favoritos",
      removedFromFavorites: "Eliminado de favoritos",
    },
    navigation: {
      home: "Inicio",
      search: "Buscar",
      favorites: "Favoritos",
      settings: "Configuración",
    },
  },
  "ja": {
    common: {
      search: "検索",
      translate: "翻訳",
      cancel: "キャンセル",
      save: "保存",
      delete: "削除",
      close: "閉じる",
      loading: "読み込み中...",
      noData: "データなし",
      error: "エラー",
      retry: "再試行",
    },
    settings: {
      title: "設定",
      language: "言語",
      version: "バージョン",
    },
    search: {
      placeholder: "単語を入力してください...",
      viewDetails: "詳細を表示するにはクリック",
      noResults: "結果が見つかりません",
      errorMessage: "検索に失敗しました。もう一度お試しください",
    },
    wordCard: {
      addToFavorite: "お気に入りに追加",
      removeFromFavorite: "お気に入りから削除",
      noDefinitions: "定義が利用できません",
      noDataFound: "データが見つかりません",
      addedToFavorites: "お気に入りに追加されました",
      removedFromFavorites: "お気に入りから削除されました",
    },
    main: {
      upload: "アップロード",
      takePhoto: "写真を撮る",
      cameraPrompt: '「アップロード」または「写真を撮る」をタップして、物体の検出を開始します。',
      processing: "処理中...",
    },
    favorites: {
      title: "お気に入り",
      loading: "お気に入りを読み込み中...",
      empty: "まだお気に入りはありません。",
      deleteTitle: "お気に入りを削除",
      deleteConfirm: '"{word}"をお気に入りから削除してもよろしいですか？',
      deleteError: "お気に入りを削除できませんでした。もう一度お試しください。",
    },
    error: {
      noDefinitionFound: "定義が見つかりません。",
      failedToFetchData: "単語データの取得に失敗しました。",
      loadWordFailed: "単語の読み込みに失敗しました。",
      favoriteOperationFailed: "お気に入り操作に失敗しました。",
    },
    toast: {
      addedToFavorites: "お気に入りに追加されました",
      removedFromFavorites: "お気に入りから削除されました",
    },
    navigation: {
      home: "ホーム",
      search: "検索",
      favorites: "お気に入り",
      settings: "設定",
    },
  },
  "ko": {
    common: {
      search: "검색",
      translate: "번역",
      cancel: "취소",
      save: "저장",
      delete: "삭제",
      close: "닫기",
      loading: "로딩 중...",
      noData: "데이터 없음",
      error: "오류",
      retry: "재시도",
    },
    settings: {
      title: "설정",
      language: "언어",
      version: "버전",
    },
    search: {
      placeholder: "단어를 입력하세요...",
      viewDetails: "세부 정보를 보려면 클릭하세요",
      noResults: "결과를 찾을 수 없습니다",
      errorMessage: "검색에 실패했습니다. 다시 시도해 주세요",
    },
    wordCard: {
      addToFavorite: "즐겨찾기에 추가",
      removeFromFavorite: "즐겨찾기에서 제거",
      noDefinitions: "사용 가능한 정의가 없습니다",
      noDataFound: "데이터를 찾을 수 없습니다",
      addedToFavorites: "즐겨찾기에 추가됨",
      removedFromFavorites: "즐겨찾기에서 제거됨",
    },
    main: {
      upload: "업로드",
      takePhoto: "사진 촬영",
      cameraPrompt: '객체 감지를 시작하려면 "업로드" 또는 "사진 촬영"을 탭하세요.',
      processing: "처리 중...",
    },
    favorites: {
      title: "즐겨찾기",
      loading: "즐겨찾기 로딩 중...",
      empty: "아직 즐겨찾기가 없습니다.",
      deleteTitle: "즐겨찾기 삭제",
      deleteConfirm: '"{word}"을(를) 즐겨찾기에서 제거하시겠습니까?',
      deleteError: "즐겨찾기를 삭제할 수 없습니다. 다시 시도해 주세요.",
    },
    error: {
      noDefinitionFound: "정의를 찾을 수 없습니다.",
      failedToFetchData: "단어 데이터를 가져오지 못했습니다.",
      loadWordFailed: "단어 로딩에 실패했습니다.",
      favoriteOperationFailed: "즐겨찾기 작업에 실패했습니다.",
    },
    toast: {
      addedToFavorites: "즐겨찾기에 추가됨",
      removedFromFavorites: "즐겨찾기에서 제거됨",
    },
    navigation: {
      home: "홈",
      search: "검색",
      favorites: "즐겨찾기",
      settings: "설정",
    },
  }
};

// 默认语言（English）
const defaultLanguage = {
  common: {
    search: "Search",
    translate: "Translate",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    close: "Close",
    loading: "Loading...",
    noData: "No data",
    error: "Error",
    retry: "Retry",
  },
  settings: {
    title: "Settings",
    language: "Language",
    version: "Version",
  },
  search: {
    placeholder: "Enter a word...",
    viewDetails: "Click to view details",
    noResults: "No results found",
    errorMessage: "Search failed, please try again",
  },
  wordCard: {
    addToFavorite: "Add to favorites",
    removeFromFavorite: "Remove from favorites",
    noDefinitions: "No definitions available",
    noDataFound: "No data found",
    addedToFavorites: "Added to favorites",
    removedFromFavorites: "Removed from favorites",
  },
  main: {
    upload: "Upload",
    takePhoto: "Take Photo",
    cameraPrompt: 'Tap "Upload" or "Take Photo" to start detecting objects.',
    processing: "Processing...",
  },
  favorites: {
    title: "Favorites",
    loading: "Loading favorites...",
    empty: "No favorites yet.",
    deleteTitle: "Delete Favorite",
    deleteConfirm: 'Are you sure you want to remove "{word}" from favorites?',
    deleteError: "Could not delete favorite. Please try again.",
  },
  error: {
    noDefinitionFound: "No definition found.",
    failedToFetchData: "Failed to fetch word data.",
    loadWordFailed: "Failed to load word.",
    favoriteOperationFailed: "Favorite operation failed.",
  },
  toast: {
    addedToFavorites: "Added to favorites",
    removedFromFavorites: "Removed from favorites",
  },
  navigation: {
    home: "Home",
    search: "Search",
    favorites: "Favorites",
    settings: "Settings",
  },
};

// 获取指定语言的文本，如果不存在则使用默认语言
export function getTranslations(langCode) {
  return translations[langCode] || defaultLanguage;
}
