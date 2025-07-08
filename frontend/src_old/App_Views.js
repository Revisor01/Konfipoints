// Render Konfi Views
if (user.type === 'konfi') {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      {/* Modals */}
      <IOSImageViewer 
        show={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        imageUrl={currentImageData?.url}
        title={currentImageData?.title}
      />
      <Modal
        show={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Aktivität beantragen"
        fullScreen={true}
        submitButtonText="Antrag senden"
        onSubmit={() => {
          const form = document.getElementById('request-form');
          if (form) {
            form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
          }
        }}
        submitDisabled={loading}
        loading={loading}
      >
        <ActivityRequestForm
          activities={activities}
          onSubmit={handleCreateActivityRequest}
          loading={loading}
          takePicture={takePicture}
        />
      </Modal>

      {/* Header - MOBIL OPTIMIERT */}
      <div className="bg-white shadow-sm border-b safe-area-top">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-blue-500" />
              <div>
                <button 
                  onClick={() => setCurrentView('konfi-dashboard')}
                  className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors text-left"
                >
                  Hallo {user.name}!
                </button>
                <p className="text-sm text-gray-600">Jahrgang: {user.jahrgang}</p>
              </div>
            </div>
            
            {/* Desktop Controls */}
            <div className="hidden sm:flex gap-3">
              <button
                onClick={() => loadKonfiData(user.id)}
                disabled={loading}
                className="bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2 font-medium text-base"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Aktualisieren
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 flex items-center gap-2 font-medium text-base"
              >
                <LogOut className="w-4 h-4" />
                Abmelden
              </button>
            </div>
            
            {/* Mobile Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden bg-gray-100 p-3 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          {/* Mobile Controls */}
          {mobileMenuOpen && (
            <div className="sm:hidden mt-4 space-y-3 pb-4 border-t pt-4">
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => {
                    loadKonfiData(user.id);
                    setMobileMenuOpen(false);
                  }}
                  disabled={loading}
                  className="bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-base"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Aktualisieren
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 font-medium text-base"
                >
                  <LogOut className="w-4 h-4" />
                  Abmelden
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0 pb-20">
        <div className="w-full max-w-4xl mx-auto px-4 py-6 flex-1">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <Loader className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          )}
          
          {/* Konfi Dashboard - STANDARDISIERT */}
          {currentView === 'konfi-dashboard' && selectedKonfi && (
            <div className="space-y-4">
              {/* Points Overview */}
              {(showGottesdienstTarget || showGemeindeTarget) && (
                <div className="grid grid-cols-1 gap-4">
                  {showGottesdienstTarget && (
                    <div className="bg-blue-50 p-4 rounded-xl shadow-sm">
                      <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Gottesdienstliche Aktivitäten
                      </h3>
                      <div className="text-3xl font-bold text-blue-600 mb-3">
                        {selectedKonfi.points.gottesdienst}/{settings.target_gottesdienst}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                        <div 
                          className={`h-4 rounded-full transition-all ${getProgressColor(selectedKonfi.points.gottesdienst, settings.target_gottesdienst)}`}
                          style={{ width: `${Math.min((selectedKonfi.points.gottesdienst / parseInt(settings.target_gottesdienst)) * 100, 100)}%` }}
                        ></div>
                      </div>
                      {selectedKonfi.points.gottesdienst >= parseInt(settings.target_gottesdienst) && (
                        <div className="text-green-600 font-bold flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Ziel erreicht!
                        </div>
                      )}
                    </div>
                  )}
                  
                  {showGemeindeTarget && (
                    <div className="bg-green-50 p-4 rounded-xl shadow-sm">
                      <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                        <Heart className="w-5 h-5" />
                        Gemeindliche Aktivitäten
                      </h3>
                      <div className="text-3xl font-bold text-green-600 mb-3">
                        {selectedKonfi.points.gemeinde}/{settings.target_gemeinde}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                        <div 
                          className={`h-4 rounded-full transition-all ${getProgressColor(selectedKonfi.points.gemeinde, settings.target_gemeinde)}`}
                          style={{ width: `${Math.min((selectedKonfi.points.gemeinde / parseInt(settings.target_gemeinde)) * 100, 100)}%` }}
                        ></div>
                      </div>
                      {selectedKonfi.points.gemeinde >= parseInt(settings.target_gemeinde) && (
                        <div className="text-green-600 font-bold flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Ziel erreicht!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="text-lg font-bold mb-4">Schnell-Aktionen</h3>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 flex items-center gap-2 text-base font-medium"
                  >
                    <Upload className="w-5 h-5" />
                    <div className="text-left flex-1">
                      <div className="font-bold">Aktivität beantragen</div>
                      <div className="text-sm opacity-90">Neue Punkte beantragen</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setCurrentView('konfi-badges')}
                    className="bg-yellow-500 text-white py-3 px-4 rounded-lg hover:bg-yellow-600 flex items-center gap-2 text-base font-medium"
                  >
                    <Award className="w-5 h-5" />
                    <div className="text-left flex-1">
                      <div className="font-bold">Meine Badges</div>
                      <div className="text-sm opacity-90">Erreichte Auszeichnungen</div>
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Statistics Dashboard */}
              <StatisticsDashboard 
                konfiData={selectedKonfi}
                allStats={ranking}
                badges={badges}
                settings={settings}
              />
              
              {/* Recent Activities */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="text-lg font-bold mb-4">Meine Aktivitäten</h3>
                {(selectedKonfi.activities || []).length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Noch keine Aktivitäten eingetragen.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(selectedKonfi.activities || []).map((activity, index) => (
                      <div key={index} className={`flex justify-between items-center p-3 rounded-lg ${
          activity.type === 'gottesdienst' ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'
        }`}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {activity.type === 'gottesdienst' ? (
                            <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          ) : (
                            <Heart className="w-4 h-4 text-green-600 flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-800 truncate">{activity.name}</div>
                            <div className="text-sm text-gray-600">
                              {formatDate(activity.date)}
                              {activity.admin && (
                                <span className="ml-2 text-xs">• {activity.admin}</span>
                              )}
                            </div>
                            {activity.category && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {activity.category.split(',').map((cat, catIndex) => (
                                  <span key={catIndex} className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full font-medium border border-purple-200">
                                    🏷️ {cat.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-orange-600 flex-shrink-0 ml-3">+{activity.points}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* KONFI CHAT - NACH den anderen Konfi-Views einfügen */}
{currentView === 'konfi-chat' && user?.type === 'konfi' && (
  <div className="h-full">
    <ChatView
      user={user}
      api={api}
      formatDate={formatDate}
      isAdmin={false}
    />
  </div>
)}

          {/* Konfi Requests - STANDARDISIERT */}
          {currentView === 'konfi-requests' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Meine Anträge</h2>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 flex items-center gap-2 font-medium text-base"
                  >
                    <Plus className="w-4 h-4" />
                    Neuer Antrag
                  </button>
                </div>
                
                {activityRequests.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Noch keine Anträge gestellt.</p>
                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="mt-4 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 flex items-center gap-2 font-medium text-base mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Ersten Antrag stellen
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activityRequests.map(request => (
                      <div 
                        key={request.id} 
                        className={`border rounded-lg p-4 transition-colors ${
          request.photo_filename 
          ? 'cursor-pointer hover:bg-gray-50 hover:border-blue-300' 
          : ''
        } ${
          request.status === 'pending' 
          ? 'border-yellow-300 bg-yellow-50' 
          : request.status === 'approved'
          ? 'border-green-300 bg-green-50'
          : 'border-red-300 bg-red-50'
        }`}
                        onClick={() => {
                          if (request.photo_filename) {
                            setCurrentImageData({
                              url: `${API_BASE_URL}/activity-requests/${request.id}/photo`,
                              title: `Foto für ${request.activity_name}`
                            });
                            setShowImageViewer(true);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-gray-800 mb-1 truncate">{request.activity_name}</h3>
                            <p className="text-sm text-gray-600 mb-1">
                              {formatDate(request.requested_date)} • {request.activity_points} Punkte
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                            <RequestStatusBadge status={request.status} />
                            {request.photo_filename && (
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
                                <Camera className="w-3 h-3" />
                                Foto
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {request.comment && (
                          <p className="text-sm text-gray-700 italic bg-white p-3 rounded-lg mb-3 border border-gray-200">
                            "{request.comment}"
                          </p>
                        )}
                        
                        {request.admin_comment && (
                          <p className="text-sm text-blue-600 italic bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <strong>Admin:</strong> {request.admin_comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Konfi Badges - STANDARDISIERT */}
          {currentView === 'konfi-badges' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-yellow-500" />
                  Meine Badges
                </h2>
                
                {badges.available ? (
                  <BadgeDisplay 
                    badges={badges.available} 
                    earnedBadges={badges.earned || []} 
                    konfiData={selectedKonfi}
                    isAdmin={false}
                    showProgress={true}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                    <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p>Badges werden geladen...</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Tab Navigation - STANDARDISIERT */}
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-40 safe-area-bottom">
    <div className="flex justify-around items-center py-2 px-2">
    {navigationItems.map(({ id, label, icon: Icon, notification }) => (
      <button
      key={id}
      onClick={() => {
        setCurrentView(id);
        setMobileMenuOpen(false);
      }}
      className={`flex flex-col items-center justify-center py-3 px-2 min-w-0 flex-1 transition-colors relative ${
        currentView === id ? 'text-blue-600' : 'text-gray-400'
      }`}
      >
      <div className="relative">
      <Icon className="w-5 h-5" />
      {notification > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]">
        {notification > 9 ? '9+' : notification}
        </span>
      )}
      </div>
      <span className="text-[10px] font-medium truncate max-w-full leading-tight mt-1">
      {label}
      </span>
      </button>
    ))}
    </div>
    </div>

    </div>
  );
}

  // Render Admin Views - KOMPLETTES INTERFACE
  if (user.type === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      {/* All modals */}
      <ImageModal 
      show={showImageModal}
      onClose={() => setShowImageModal(false)}
      imageUrl={currentImage?.url}
      title={currentImage?.title}
      />
      <IOSImageViewer 
      show={showImageViewer}
      onClose={() => setShowImageViewer(false)}
      imageUrl={currentImageData?.url}
      title={currentImageData?.title}
      />
      <BonusPointsModal 
      show={showBonusModal}
      onClose={() => {
        setShowBonusModal(false);
        setBonusDescription('');
        setBonusPoints(1);
        setBonusDate(new Date().toISOString().split('T')[0]);
        setBonusKonfiId(null);
      }}
      konfiId={bonusKonfiId}
      konfis={konfis}
      description={bonusDescription}
      setDescription={setBonusDescription}
      points={bonusPoints}
      setPoints={setBonusPoints}
      type={bonusType}
      setType={setBonusType}
      date={bonusDate}
      setDate={setBonusDate}
      onSubmit={addBonusPoints}
      loading={loading}
      />
      <EditModal 
      show={showEditModal}
      onClose={() => {
        setShowEditModal(false);
        setEditItem(null);
      }}
      editType={editType}
      editItem={editItem}
      jahrgaenge={jahrgaenge}
      onSave={(type, id, data) => {
        if (type === 'konfi') {
          handleUpdate('konfis', id, {
            name: data.name,
            jahrgang_id: data.jahrgang_id
          });
        } else if (type === 'activity') {
          handleUpdate('activities', id, {
            name: data.name,
            points: data.points,
            type: data.type,
            category: data.category
          });
        } else if (type === 'jahrgang') {
          handleUpdate('jahrgaenge', id, {
            name: data.name,
            confirmation_date: data.confirmation_date
          });
        } else if (type === 'admin') {
          handleUpdate('admins', id, {
            username: data.username,
            display_name: data.display_name,
            password: data.password || undefined
          });
        }
      }}
      loading={loading}
      />
      <AdminModal 
      show={showAdminModal}
      onClose={() => {
        setShowAdminModal(false);
        setAdminForm({ username: '', display_name: '', password: '' });
      }}
      adminForm={adminForm}
      setAdminForm={setAdminForm}
      onSubmit={() => handleCreate('admins', adminForm)}
      loading={loading}
      />
      <RequestManagementModal
      show={showRequestManagementModal}
      onClose={() => {
        setShowRequestManagementModal(false);
        setSelectedRequest(null);
      }}
      request={selectedRequest}
      onUpdateStatus={handleUpdateRequestStatus}
      loading={loading}
      onSetCurrentImageData={setCurrentImageData}
      onSetShowImageViewer={setShowImageViewer}
      />
      <DeleteConfirmModal />
      <MobileBadgeModal 
      show={showMobileBadgeModal}
      onClose={() => {
        setShowMobileBadgeModal(false);
        setEditBadge(null);
      }}
      badge={editBadge}
      criteriaTypes={criteriaTypes}
      activities={activities}
      onSubmit={editBadge ? handleUpdateBadge : handleCreateBadge}
      loading={loading}
      />
      
      {/* Minimaler Header nur bei Detail-Views - MEHR ABSTAND OBEN */}
      {currentView === 'konfi-detail' && (
        <div className="bg-white border-b border-gray-100 pt-14 safe-area-top">
        <div className="max-w-7xl mx-auto px-4 pb-3">
        <div className="flex items-center justify-between">
        <button
        onClick={() => setCurrentView('konfis')}
        className="text-blue-600 font-medium text-sm"
        >
        ← Zurück
        </button>
        
        <h1 className="text-base font-medium text-gray-900">
        {selectedKonfi?.name}
        </h1>
        
        <div className="w-16"></div>
        </div>
        </div>
        </div>
      )}
      
      {/* Content mit Bottom Padding */}
      <div className="flex-1 pb-24">
      <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {loading && (
        <div className="flex justify-center items-center py-8">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}
      
{/* KONFIS - KOMBINIERT - KORRIGIERT */}
{currentView === 'konfis' && (
  <div className="space-y-4 pt-10">
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-3">Konfis Verwaltung</h2>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold">{filteredKonfis.length}</div>
          <div className="text-xs opacity-80">Konfis</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{filteredKonfis.reduce((sum, k) => sum + k.points.gottesdienst + k.points.gemeinde, 0)}</div>
          <div className="text-xs opacity-80">Punkte</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{filteredKonfis.reduce((sum, k) => sum + (k.badgeCount || 0), 0)}</div>
          <div className="text-xs opacity-80">Badges</div>
        </div>
      </div>
    </div>
    
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-3">Neuen Konfi hinzufügen</h3>
      <div className="space-y-3">
        <input
          type="text"
          value={newKonfiName}
          onChange={(e) => setNewKonfiName(e.target.value)}
          placeholder="Name des Konfis"
          className="w-full p-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:bg-white"
        />
        <select
          value={newKonfiJahrgang}
          onChange={(e) => setNewKonfiJahrgang(e.target.value)}
          className="w-full p-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:bg-white"
        >
          <option value="">Jahrgang wählen</option>
          {jahrgaenge.map(j => (
            <option key={j.id} value={j.id}>{j.name}</option>
          ))}
        </select>
        <button
          onClick={() => handleCreate('konfis', { 
            name: newKonfiName.trim(), 
            jahrgang_id: newKonfiJahrgang 
          })}
          disabled={loading || !newKonfiName.trim() || !newKonfiJahrgang}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-base"
        >
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Hinzufügen
        </button>
      </div>
    </div>
    
    {/* Filter und Sortierung */}
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-3">Filter</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nach Name suchen..."
            className="w-full pl-10 pr-4 py-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
        
        <div className="relative">
          <select
            value={selectedJahrgang}
            onChange={(e) => setSelectedJahrgang(e.target.value)}
            className="w-full p-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:bg-white appearance-none"
          >
            <option value="alle">Alle Jahrgänge</option>
            {jahrgaenge.map(j => (
              <option key={j.id} value={j.name}>{j.name}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full p-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:bg-white appearance-none"
          >
            <option value="name">Nach Name</option>
            <option value="points">Nach Punkten</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
    
    <div className="space-y-3">
      {filteredKonfis
        .sort((a, b) => {
          if (sortBy === 'points') {
            const aTotal = a.points.gottesdienst + a.points.gemeinde;
            const bTotal = b.points.gottesdienst + b.points.gemeinde;
            return bTotal - aTotal;
          }
          return a.name.localeCompare(b.name);
        })
        .map(konfi => (
          <div
            key={konfi.id}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
            onClick={() => loadKonfiDetails(konfi.id)}
          >
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <h3 className="font-bold text-lg text-gray-800 leading-tight">
                  {konfi.name}
                </h3>
              </div>
              
              <div className="text-center flex-shrink-0 min-w-[60px]">
                <div className="text-xl font-bold text-purple-600">
                  {konfi.points.gottesdienst + konfi.points.gemeinde}
                </div>
                <div className="text-xs text-gray-500">Punkte</div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              {konfi.jahrgang} • {konfi.username}
            </p>
            
            <div className="space-y-3">
              {showGottesdienstTarget && (
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Gottesdienst</span>
                    </div>
                    <span className="text-sm font-bold text-blue-600">
                      {konfi.points.gottesdienst}/{settings.target_gottesdienst}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getProgressColor(konfi.points.gottesdienst, settings.target_gottesdienst)}`}
                      style={{ width: `${Math.min((konfi.points.gottesdienst / parseInt(settings.target_gottesdienst)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {showGemeindeTarget && (
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Gemeinde</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">
                      {konfi.points.gemeinde}/{settings.target_gemeinde}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getProgressColor(konfi.points.gemeinde, settings.target_gemeinde)}`}
                      style={{ width: `${Math.min((konfi.points.gemeinde / parseInt(settings.target_gemeinde)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      
      {filteredKonfis.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Keine Konfis gefunden</p>
        </div>
      )}
    </div>
  </div>
)}

      {/* REQUESTS MANAGEMENT */}
      {currentView === 'requests' && (
        <div className="space-y-4">
        {/* Action Sheets */}
        <RequestActionSheet
        show={showRequestActionSheet}
        onClose={() => {
          setShowRequestActionSheet(false);
          setSelectedActionRequest(null);
        }}
        request={selectedActionRequest}
        onApprove={() => handleUpdateRequestStatus(selectedActionRequest.id, 'approved')}
        onReject={(comment) => handleUpdateRequestStatus(selectedActionRequest.id, 'rejected', comment)}
        onEdit={() => {
          setSelectedRequest(selectedActionRequest);
          setShowRequestManagementModal(true);
        }}
        onShowPhoto={() => {
          setCurrentImageData({
            url: `${API_BASE_URL}/activity-requests/${selectedActionRequest.id}/photo`,
            title: `Foto für ${selectedActionRequest.activity_name}`
          });
          setShowImageViewer(true);
        }}
        loading={loading}
        />
        
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-3">Anträge verwalten</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
        <div>
        <div className="text-2xl font-bold">{activityRequests.filter(r => r.status === 'pending').length}</div>
        <div className="text-xs opacity-80">Offen</div>
        </div>
        <div>
        <div className="text-2xl font-bold">{activityRequests.filter(r => r.status === 'approved').length}</div>
        <div className="text-xs opacity-80">Genehmigt</div>
        </div>
        <div>
        <div className="text-2xl font-bold">{activityRequests.filter(r => r.status === 'rejected').length}</div>
        <div className="text-xs opacity-80">Abgelehnt</div>
        </div>
        </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-yellow-700 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Offene Anträge
        </h3>
        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
        {activityRequests.filter(r => r.status === 'pending').length}
        </span>
        </div>
        
        <div className="space-y-3">
        {activityRequests.filter(r => r.status === 'pending').length === 0 ? (
          <div className="text-center py-8 text-gray-600 bg-gray-50 rounded-lg">
          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Keine offenen Anträge</p>
          </div>
        ) : (
          activityRequests.filter(r => r.status === 'pending').map(request => (
            <div 
            key={request.id}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 cursor-pointer hover:bg-yellow-100 transition-colors"
            onClick={() => {
              setSelectedActionRequest(request);
              setShowRequestActionSheet(true);
            }}
            >
            <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
            <h4 className="font-bold text-gray-800 text-base mb-1">{request.konfi_name}</h4>
            <p className="text-sm text-gray-600 mb-1">{request.activity_name}</p>
            <p className="text-xs text-gray-500">{formatDate(request.requested_date)}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            <span className="text-sm font-medium text-yellow-700 bg-yellow-200 px-2 py-1 rounded-full">
            {request.activity_points}P
            </span>
            <Clock className="w-4 h-4 text-yellow-600" />
            {request.photo_filename && (
              <Camera className="w-4 h-4 text-blue-600" />
            )}
            </div>
            </div>
            
            {request.comment && (
              <p className="text-sm text-gray-700 italic bg-white p-2 rounded mt-2 line-clamp-2">
              "{request.comment}"
              </p>
            )}
            </div>
          ))
        )}
        </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
        <CheckCircle className="w-5 h-5" />
        Bearbeitete Anträge
        </h3>
        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
        Letzte 10
        </span>
        </div>
        
        <div className="space-y-3">
        {activityRequests.filter(r => r.status !== 'pending').slice(0, 10).map(request => (
          <div 
          key={request.id}
          className={`border rounded-lg p-3 cursor-pointer transition-colors ${
            request.status === 'approved' 
            ? 'bg-green-50 border-green-200 hover:bg-green-100' 
            : 'bg-red-50 border-red-200 hover:bg-red-100'
          }`}
          onClick={() => {
            setSelectedActionRequest(request);
            setShowRequestActionSheet(true);
          }}
          >
          <div className="flex items-center justify-between">
          <div className="flex-1">
          <h4 className="font-bold text-base mb-1">{request.konfi_name}</h4>
          <p className="text-sm text-gray-600">{request.activity_name}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <span className="text-sm font-medium text-gray-700 bg-gray-200 px-2 py-1 rounded-full">
          {request.activity_points}P
          </span>
          {request.status === 'approved' ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
          {request.photo_filename && (
            <Camera className="w-4 h-4 text-blue-600" />
          )}
          </div>
          </div>
          
          {/* NUR User-Kommentar, KEIN Admin-Kommentar oder Datum */}
          {request.comment && (
            <p className="text-sm text-gray-700 italic bg-white p-2 rounded mt-2 line-clamp-2">
            "{request.comment}"
            </p>
          )}
          </div>
        ))}
        
        {activityRequests.filter(r => r.status !== 'pending').length === 0 && (
          <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
          <p className="text-sm">Noch keine bearbeiteten Anträge</p>
          </div>
        )}
        </div>
        </div>
        </div>
      )}
      
      {/* ACTIVITIES MANAGEMENT */}
      {currentView === 'manage-activities' && (
        <div className="space-y-4 pt-10">
        {/* Activity Action Sheet */}
        <ActivityActionSheet
        show={showActivityActionSheet}
        onClose={() => {
          setShowActivityActionSheet(false);
          setSelectedActionActivity(null);
        }}
        activity={selectedActionActivity}
        onEdit={() => {
          setEditType('activity');
          setEditItem(selectedActionActivity);
          setShowEditModal(true);
        }}
        onDelete={() => {
          setDeleteType('activity');
          setDeleteItem(selectedActionActivity);
          setShowDeleteModal(true);
        }}
        />
        
        <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-3">Aktivitäten verwalten</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
        <div>
        <div className="text-2xl font-bold">{activities.length}</div>
        <div className="text-xs opacity-80">Aktivitäten</div>
        </div>
        <div>
        <div className="text-2xl font-bold">{activities.filter(a => a.type === 'gottesdienst').length}</div>
        <div className="text-xs opacity-80">Gottesdienst</div>
        </div>
        <div>
        <div className="text-2xl font-bold">{activities.filter(a => a.type === 'gemeinde').length}</div>
        <div className="text-xs opacity-80">Gemeinde</div>
        </div>
        </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-3">Neue Aktivität hinzufügen</h3>
        <div className="space-y-3">
        <input
        type="text"
        value={newActivityName}
        onChange={(e) => setNewActivityName(e.target.value)}
        placeholder="Name der Aktivität"
        className="w-full p-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:bg-white"
        />
        <div className="grid grid-cols-2 gap-3">
        <input
        type="number"
        value={newActivityPoints}
        onChange={(e) => setNewActivityPoints(parseInt(e.target.value) || 1)}
        min="1"
        max="10"
        placeholder="Punkte"
        className="p-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:bg-white"
        />
        <select
        value={newActivityType}
        onChange={(e) => setNewActivityType(e.target.value)}
        className="p-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:bg-white"
        >
        <option value="gottesdienst">Gottesdienstlich</option>
        <option value="gemeinde">Gemeindlich</option>
        </select>
        </div>
        <input
        type="text"
        value={newActivityCategory}
        onChange={(e) => setNewActivityCategory(e.target.value)}
        placeholder="Kategorien (kommagetrennt: Kinder,Fest)"
        className="w-full p-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:bg-white"
        />
        <button
        onClick={() => handleCreate('activities', {
          name: newActivityName.trim(),
          points: newActivityPoints,
          type: newActivityType,
          category: newActivityCategory.trim()
        })}
        disabled={loading || !newActivityName.trim()}
        className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
        >
        {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        Hinzufügen
        </button>
        </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-blue-800 flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5" />
        Gottesdienstliche Aktivitäten
        </h3>
        <div className="space-y-3">
        {activities.filter(a => a.type === 'gottesdienst').map(activity => (
          <div 
          key={activity.id}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={() => {
            setSelectedActionActivity(activity);
            setShowActivityActionSheet(true);
          }}
          >
          <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-gray-800 text-base flex-1">{activity.name}</h4>
          <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-blue-700 bg-blue-200 px-2 py-1 rounded-full">
          {activity.points}P
          </span>
          <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          </div>
          
          {activity.category && (
            <div className="flex flex-wrap gap-1">
            {activity.category.split(',').map((cat, index) => (
              <span key={index} className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
              {cat.trim()}
              </span>
            ))}
            </div>
          )}
          </div>
        ))}
        
        {activities.filter(a => a.type === 'gottesdienst').length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Keine gottesdienstlichen Aktivitäten</p>
          </div>
        )}
        </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-green-800 flex items-center gap-2 mb-4">
        <Heart className="w-5 h-5" />
        Gemeindliche Aktivitäten
        </h3>
        <div className="space-y-3">
        {activities.filter(a => a.type === 'gemeinde').map(activity => (
          <div 
          key={activity.id}
          className="bg-green-50 border border-green-200 rounded-lg p-4 cursor-pointer hover:bg-green-100 transition-colors"
          onClick={() => {
            setSelectedActionActivity(activity);
            setShowActivityActionSheet(true);
          }}
          >
          <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-gray-800 text-base flex-1">{activity.name}</h4>
          <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-green-700 bg-green-200 px-2 py-1 rounded-full">
          {activity.points}P
          </span>
          <Heart className="w-4 h-4 text-green-600" />
          </div>
          </div>
          
          {activity.category && (
            <div className="flex flex-wrap gap-1">
            {activity.category.split(',').map((cat, index) => (
              <span key={index} className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
              {cat.trim()}
              </span>
            ))}
            </div>
          )}
          </div>
        ))}
        
        {activities.filter(a => a.type === 'gemeinde').length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <Heart className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Keine gemeindlichen Aktivitäten</p>
          </div>
        )}
        </div>
        </div>
        </div>
      )}
      
      {/* BADGES MANAGEMENT */}
      {currentView === 'manage-badges' && (
        <div className="space-y-4 pt-10">
        <BadgeEditActionSheet
        show={showBadgeActionSheet}
        onClose={() => {
          setShowBadgeActionSheet(false);
          setSelectedActionBadge(null);
        }}
        badge={selectedActionBadge}
        onEdit={() => {
          setEditBadge(selectedActionBadge);
          setShowMobileBadgeModal(true);
        }}
        onDelete={() => {
          setDeleteType('badge');
          setDeleteItem(selectedActionBadge);
          setShowDeleteModal(true);
        }}
        criteriaTypes={criteriaTypes}
        />
        
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-3">Badge Verwaltung</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
        <div>
        <div className="text-2xl font-bold">{badges.length}</div>
        <div className="text-xs opacity-80">Badges</div>
        </div>
        <div>
        <div className="text-2xl font-bold">{badges.filter(b => b.is_active).length}</div>
        <div className="text-xs opacity-80">Aktiv</div>
        </div>
        <div>
        <div className="text-2xl font-bold">{badges.filter(b => b.is_hidden).length}</div>
        <div className="text-xs opacity-80">Geheim</div>
        </div>
        </div>
        </div>
        
        <button
        onClick={() => {
          setEditBadge(null);
          setShowMobileBadgeModal(true);
        }}
        className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2 font-medium"
        >
        <Plus className="w-4 h-4" />
        Neues Badge erstellen
        </button>
        
        <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="relative">
        <select
        value={badgeFilter}
        onChange={(e) => setBadgeFilter(e.target.value)}
        className="w-full p-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:bg-white appearance-none"
        >
        <option value="all">Alle Badges</option>
        <option value="active">Nur Aktive</option>
        <option value="inactive">Nur Inaktive</option>
        <option value="hidden">Nur Geheime</option>
        <option value="visible">Nur Sichtbare</option>
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        
        <div className="relative">
        <select
        value={badgeSort}
        onChange={(e) => setBadgeSort(e.target.value)}
        className="w-full p-3 border-0 bg-gray-50 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:bg-white appearance-none"
        >
        <option value="name">Nach Name</option>
        <option value="criteria">Nach Kriterium</option>
        <option value="status">Nach Status</option>
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        </div>
        </div>
        
        <div className="space-y-3">
        {badges.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl">
          <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Keine Badges vorhanden</p>
          </div>
        ) : (
          badges
          .filter(badge => {
            if (badgeFilter === 'active') return badge.is_active;
            if (badgeFilter === 'inactive') return !badge.is_active;
            if (badgeFilter === 'hidden') return badge.is_hidden;
            if (badgeFilter === 'visible') return !badge.is_hidden;
            return true;
          })
          .sort((a, b) => {
            if (badgeSort === 'criteria') return a.criteria_type.localeCompare(b.criteria_type);
            if (badgeSort === 'status') return Number(b.is_active) - Number(a.is_active);
            return a.name.localeCompare(b.name);
          })
          // KORRIGIERTE Badge-Anzeige mit besserem Layout
          .map(badge => (
            <div 
            key={badge.id} 
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100"
            onClick={() => {
              setSelectedActionBadge(badge);
              setShowBadgeActionSheet(true);
            }}
            >
            <div className="space-y-4">
            {/* ERSTE ZEILE: Icon + Name + Buttons */}
            <div className="flex items-start gap-4">
            <div className="flex-shrink-0 text-center">
            <div className="text-3xl">{badge.icon}</div>
            </div>
            
            <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-800 leading-tight">{badge.name}</h3>
            <p className="text-sm text-gray-600 leading-relaxed mt-1">{badge.description}</p>
            </div>
            
            {/* Status-Dots rechts */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${badge.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            {badge.is_hidden && <div className="w-3 h-3 rounded-full bg-purple-500"></div>}
            </div>
            <div className="text-xs text-gray-500 text-center">
            {badge.is_active ? 'Aktiv' : 'Inaktiv'}
            {badge.is_hidden && <div className="text-purple-600">Geheim</div>}
            </div>
            </div>
            </div>
            
            {/* ZWEITE ZEILE: Kriterium über volle Breite */}
            <div className="bg-gray-50 px-3 py-2 rounded-lg">
            <p className="text-xs text-gray-700 font-medium">
            {criteriaTypes[badge.criteria_type]?.label} ≥ {badge.criteria_value}
            </p>
            </div>
            
            {/* DRITTE ZEILE: Vergabe-Statistik über volle Breite */}
            <div className={`text-center py-2 px-3 rounded-lg border ${
              badge.earned_count > 0 
              ? 'text-green-700 bg-green-50 border-green-200' 
              : 'text-gray-600 bg-gray-50 border-gray-200'
            }`}>
            <span className="text-sm font-bold">{badge.earned_count}</span>
            <span className="text-xs ml-1">mal vergeben</span>
            </div>
            </div>
            </div>
          ))
        )}
        </div>
        </div>
      )}
      
      {/* ADMIN CHAT - NACH den anderen Admin-Views einfügen */}
{currentView === 'chat' && user?.type === 'admin' && (
  <div className="h-full">
    <ChatView
      user={user}
      api={api}
      formatDate={formatDate}
      isAdmin={true}
    />
  </div>
)}

      {/* SETTINGS MIT JAHRGÄNGEN - VERBESSERT */}

{currentView === 'settings' && (
  <div className="space-y-4 pt-10">
    {/* Action Sheets */}
    <JahrgangActionSheet
      show={showJahrgangActionSheet}
      onClose={() => {
        setShowJahrgangActionSheet(false);
        setSelectedActionJahrgang(null);
      }}
      jahrgang={selectedActionJahrgang}
      onEdit={() => {
        setEditType('jahrgang');
        setEditItem(selectedActionJahrgang);
        setShowEditModal(true);
      }}
      onDelete={() => {
        setDeleteType('jahrgang');
        setDeleteItem(selectedActionJahrgang);
        setShowDeleteModal(true);
      }}
      konfiCount={selectedActionJahrgang ? konfis.filter(k => k.jahrgang === selectedActionJahrgang.name).length : 0}
    />

    <AdminActionSheet
      show={showAdminActionSheet}
      onClose={() => {
        setShowAdminActionSheet(false);
        setSelectedActionAdmin(null);
      }}
      admin={selectedActionAdmin}
      onEdit={() => {
        setEditType('admin');
        setEditItem(selectedActionAdmin);
        setShowEditModal(true);
      }}
      onDelete={() => {
        setDeleteType('admin');
        setDeleteItem(selectedActionAdmin);
        setShowDeleteModal(true);
      }}
      currentUserId={user.id}
    />

    {/* Neue Modals */}
    <JahrgangModal 
      show={showJahrgangModal}
      onClose={() => {
        setShowJahrgangModal(false);
        setJahrgangForm({ name: '', confirmation_date: '' });
      }}
      jahrgangForm={jahrgangForm}
      setJahrgangForm={setJahrgangForm}
      onSubmit={() => handleCreate('jahrgaenge', jahrgangForm)}
      loading={loading}
    />

    {/* Header Card */}
    <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-4">Einstellungen</h2>
      <p className="text-sm opacity-90">System-Konfiguration und Verwaltung</p>
    </div>

    {/* Zielpunkte */}
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-4">Zielpunkte</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Gottesdienst</h4>
          <input
            type="number"
            value={settings.target_gottesdienst}
            onChange={(e) => setSettings({
              ...settings,
              target_gottesdienst: e.target.value
            })}
            min="0"
            max="50"
            className="w-full p-2 border-0 bg-white rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">Gemeinde</h4>
          <input
            type="number"
            value={settings.target_gemeinde}
            onChange={(e) => setSettings({
              ...settings,
              target_gemeinde: e.target.value
            })}
            min="0"
            max="50"
            className="w-full p-2 border-0 bg-white rounded focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
      
      <button
        onClick={updateSettings}
        disabled={loading}
        className="mt-4 w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
      >
        {loading && <Loader className="w-4 h-4 animate-spin" />}
        Speichern
      </button>
    </div>

    {/* Jahrgänge */}
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800">Jahrgänge</h3>
        <button
          onClick={() => setShowJahrgangModal(true)}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          Neuer Jahrgang
        </button>
      </div>
      
      <div className="space-y-3">
        {jahrgaenge.map(jahrgang => {
          const konfiCount = konfis.filter(k => k.jahrgang === jahrgang.name).length;
          
          return (
            <div 
              key={jahrgang.id} 
              className="bg-purple-50 border border-purple-200 rounded-lg p-4 cursor-pointer hover:bg-purple-100 transition-colors"
              onClick={() => {
                setSelectedActionJahrgang(jahrgang);
                setShowJahrgangActionSheet(true);
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-gray-900">Jahrgang {jahrgang.name}</div>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {konfiCount} Konfis
                </span>
              </div>
              {jahrgang.confirmation_date && (
                <div className="text-sm text-gray-600">
                  Konfirmation: {formatDate(jahrgang.confirmation_date)}
                </div>
              )}
            </div>
          );
        })}
        
        {jahrgaenge.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Noch keine Jahrgänge angelegt</p>
          </div>
        )}
      </div>
    </div>

    {/* Administrator */}
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800">Administrator</h3>
        <button
          onClick={() => setShowAdminModal(true)}
          className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          Neuer Admin
        </button>
      </div>
      
      <div className="space-y-3">
        {admins.map(admin => (
          <div 
            key={admin.id} 
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => {
              setSelectedActionAdmin(admin);
              setShowAdminActionSheet(true);
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{admin.display_name}</div>
                <div className="text-sm text-gray-600">@{admin.username}</div>
              </div>
              {admin.id === user.id && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  Sie
                </span>
              )}
            </div>
          </div>
        ))}
        
        {admins.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            <UserPlus className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Noch keine Admins angelegt</p>
          </div>
        )}
      </div>
    </div>

    {/* Abmelden */}
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <button
        onClick={handleLogout}
        className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 font-medium"
      >
        <LogOut className="w-4 h-4" />
        Abmelden
      </button>
    </div>

    {/* Footer mit Versionsnummer und Copyright */}
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="text-center space-y-2">
        <div className="text-sm font-medium text-gray-800">
          Konfi-Punkte-System v2.0.0
        </div>
        <div className="text-xs text-gray-600">
          Entwickelt von <span className="font-medium">Pastor Simon Luthe</span>
        </div>
        <div className="text-xs text-gray-500">
          © 2025 Gemeinde Büsum, Neuenkirchen & Wesselburen
        </div>
        <div className="text-xs text-gray-500">
          <a 
            href="https://github.com/Revisor01/Konfipoints" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            GitHub Repository
          </a>
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Mit ❤️ für die Konfirmandenarbeit entwickelt
        </div>
      </div>
    </div>
  </div>
)}

      {/* KONFI DETAIL VIEW */}
{currentView === 'konfi-detail' && selectedKonfi && (
  <div className="space-y-4">
    {/* Action Sheets */}
    <KonfiActivityActionSheet
      show={showActivityActionSheet}
      onClose={() => {
        setShowActivityActionSheet(false);
        setSelectedActionActivity(null);
      }}
      activity={selectedActionActivity}
      onRemove={() => removeActivityFromKonfi(selectedKonfi.id, selectedActionActivity.id)}
      loading={loading}
      konfiName={selectedKonfi.name}
    />
    
    <KonfiBonusActionSheet
      show={showBonusActionSheet}
      onClose={() => {
        setShowBonusActionSheet(false);
        setSelectedActionBonus(null);
      }}
      bonus={selectedActionBonus}
      onRemove={() => removeBonusPointsFromKonfi(selectedKonfi.id, selectedActionBonus.id)}
      loading={loading}
      konfiName={selectedKonfi.name}
    />

    {/* Header Card */}
    <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-2">{selectedKonfi.name}</h2>
      <p className="text-sm opacity-90">
        {selectedKonfi.jahrgang} • {selectedKonfi.username}
      </p>
      <div className="grid grid-cols-3 gap-4 mt-4 text-center">
        <div>
          <div className="text-2xl font-bold">{selectedKonfi.points.gottesdienst + selectedKonfi.points.gemeinde}</div>
          <div className="text-xs opacity-80">Punkte</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{selectedKonfi.activities?.length || 0}</div>
          <div className="text-xs opacity-80">Aktivitäten</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{selectedKonfi.badges?.length || 0}</div>
          <div className="text-xs opacity-80">Badges</div>
        </div>
      </div>
    </div>

    {/* Actions Card */}
<div className="bg-white rounded-xl p-4 shadow-sm">
  <h3 className="font-bold text-gray-800 mb-3">Aktionen</h3>
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    <button
      onClick={() => {
        setBonusKonfiId(selectedKonfi.id);
        setShowBonusModal(true);
      }}
      className="bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2 font-medium text-base"
    >
      <Gift className="w-4 h-4" />
      Zusatzpunkte
    </button>
    <button
      onClick={() => regeneratePassword(selectedKonfi.id)}
      className="bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 font-medium text-base"
    >
      <RefreshCw className="w-4 h-4" />
      Neues Passwort
    </button>
    <button
      onClick={() => {
        setDeleteType('konfi');
        setDeleteItem(selectedKonfi);
        setShowDeleteModal(true);
      }}
      className="bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 font-medium text-base"
    >
      <Trash2 className="w-4 h-4" />
      Löschen
    </button>
  </div>

  {/* Password Display */}
  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-600">Passwort:</span>
      {passwordVisibility[selectedKonfi.id] ? (
        <span className="font-mono">{selectedKonfi.password}</span>
      ) : (
        <span>••••••••••</span>
      )}
      <button
        onClick={() => togglePasswordVisibility(selectedKonfi.id)}
        className="text-blue-500 hover:text-blue-700 p-1"
      >
        {passwordVisibility[selectedKonfi.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
      </button>
    </div>
  </div>
</div>
{/* Progress Cards */}
    {(showGottesdienstTarget || showGemeindeTarget) && (
      <div className={`grid gap-4 ${showGottesdienstTarget && showGemeindeTarget ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {showGottesdienstTarget && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Gottesdienst
            </h3>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {selectedKonfi.points.gottesdienst}/{settings.target_gottesdienst}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${getProgressColor(selectedKonfi.points.gottesdienst, settings.target_gottesdienst)}`}
                style={{ width: `${Math.min((selectedKonfi.points.gottesdienst / parseInt(settings.target_gottesdienst)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {showGemeindeTarget && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Gemeinde
            </h3>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {selectedKonfi.points.gemeinde}/{settings.target_gemeinde}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${getProgressColor(selectedKonfi.points.gemeinde, settings.target_gemeinde)}`}
                style={{ width: `${Math.min((selectedKonfi.points.gemeinde / parseInt(settings.target_gemeinde)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    )}

    {/* Badges Card */}
    {selectedKonfi.badges && selectedKonfi.badges.length > 0 && (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-yellow-800 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Erreichte Badges ({selectedKonfi.badges.length})
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {selectedKonfi.badges.map(badge => (
            <div key={badge.id} className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl mb-2">{badge.icon}</div>
              <div className="text-xs font-bold text-yellow-800 leading-tight mb-1">{badge.name}</div>
              <div className="text-xs text-gray-500">{formatDate(badge.earned_at)}</div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Quick Assignment Card */}
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-4">Schnell-Zuordnung</h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
          <div className="relative">
            <input
              type="date"
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
              className="w-full p-3 border-0 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white appearance-none"
              style={{ 
                WebkitAppearance: 'none',
                MozAppearance: 'textfield',
                maxWidth: '100%',
                boxSizing: 'border-box'
              }}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sortierung</label>
          <div className="relative">
            <select
              value={activitySort}
              onChange={(e) => setActivitySort(e.target.value)}
              className="w-full p-3 border-0 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white appearance-none"
            >
              <option value="name">Nach Name</option>
              <option value="points">Nach Punkten</option>
              <option value="type">Nach Typ</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {activities
          .sort((a, b) => {
            if (activitySort === 'points') return b.points - a.points;
            if (activitySort === 'type') return a.type.localeCompare(b.type);
            return a.name.localeCompare(b.name);
          })
          .map(activity => (
            <button
              key={activity.id}
              onClick={() => assignActivityToKonfi(selectedKonfi.id, activity.id)}
              disabled={loading}
              className={`w-full text-left p-3 rounded-lg border text-sm disabled:opacity-50 transition-colors ${
          activity.type === 'gottesdienst' 
          ? 'bg-blue-50 hover:bg-blue-100 border-blue-200' 
          : 'bg-green-50 hover:bg-green-100 border-green-200'
        }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {activity.type === 'gottesdienst' ? (
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Heart className="w-4 h-4 text-green-600" />
                  )}
                  <span className="font-medium">{activity.name}</span>
                </div>
                <span className={`font-bold ${
          activity.type === 'gottesdienst' ? 'text-blue-600' : 'text-green-600'
        }`}>
                  +{activity.points}
                </span>
              </div>
            </button>
          ))}
      </div>
    </div>

    {/* Activities & Bonus Points List */}
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-4">Absolvierte Aktivitäten & Zusatzpunkte</h3>
      {(selectedKonfi.activities.length === 0 && (!selectedKonfi.bonusPoints || selectedKonfi.bonusPoints.length === 0)) ? (
        <p className="text-gray-600 text-center py-8">Noch keine Aktivitäten absolviert.</p>
      ) : (
        <div className="space-y-3">
          {/* Aktivitäten */}
          {selectedKonfi.activities.map((activity, index) => (
            <div 
              key={`activity-${index}`}
              className={`border rounded-lg p-3 cursor-pointer transition-colors hover:shadow-md ${
          activity.type === 'gottesdienst' 
          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
          : 'bg-green-50 border-green-200 hover:bg-green-100'
        }`}
              onClick={() => {
                setSelectedActionActivity(activity);
                setShowActivityActionSheet(true);
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {activity.type === 'gottesdienst' ? (
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Heart className="w-4 h-4 text-green-600" />
                  )}
                  <h4 className="font-bold text-gray-800 text-sm">{activity.name}</h4>
                </div>
                <span className={`font-bold text-sm ${
          activity.type === 'gottesdienst' ? 'text-blue-600' : 'text-green-600'
        }`}>
                  +{activity.points}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{activity.admin || 'System'}</span>
                <span>{formatDate(activity.date)}</span>
              </div>

              {activity.category && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {activity.category.split(',').map((cat, catIndex) => (
                    <span key={catIndex} className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                      {cat.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Zusatzpunkte */}
          {selectedKonfi.bonusPoints && selectedKonfi.bonusPoints.map((bonus, index) => (
            <div 
              key={`bonus-${index}`}
              className="border rounded-lg p-3 cursor-pointer transition-colors hover:shadow-md bg-orange-50 border-orange-200 hover:bg-orange-100"
              onClick={() => {
                setSelectedActionBonus(bonus);
                setShowBonusActionSheet(true);
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-orange-600" />
                  <h4 className="font-bold text-gray-800 text-sm">{bonus.description}</h4>
                </div>
                <span className="font-bold text-sm text-orange-600">+{bonus.points}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{bonus.admin || 'System'}</span>
                <span>{formatDate(bonus.date)}</span>
              </div>

              <div className="mt-1">
                <span className={`text-xs px-2 py-1 rounded-full ${
          bonus.type === 'gottesdienst' 
          ? 'bg-blue-100 text-blue-800' 
          : 'bg-green-100 text-green-800'
        }`}>
                  {bonus.type === 'gottesdienst' ? 'Gottesdienstlich' : 'Gemeindlich'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}
</div>
      </div>
      
      {/* Bottom Tab Navigation */}
      <BottomTabNavigation 
      currentView={currentView}
      setCurrentView={setCurrentView}
      navigationItems={navigationItems}
      />
      </div>
    );
  }
};