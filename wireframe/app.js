/**
 * CAK.APP Interactive Prototype Controller
 * Implements smooth screen transitions, clickable button areas,
 * virtual keyboards, confirmation modal, and demo tools.
 */

document.addEventListener('DOMContentLoaded', () => {
  function dateInDays(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const initialTasks = [
    {
      id: 1,
      title: 'Review mockup dashboard v4',
      assignee: 'Anda',
      dueDate: dateInDays(1),
      status: 'Sedang dikerjakan',
      source: 'Dari percakapan Design Team'
    },
    {
      id: 2,
      title: 'Rapikan posisi tombol CTA',
      assignee: 'Sarah',
      dueDate: dateInDays(2),
      status: 'Belum dimulai',
      source: 'Dari thread diskusi desain'
    },
    {
      id: 3,
      title: 'Validasi ekspor telemetry',
      assignee: 'David',
      dueDate: dateInDays(3),
      status: 'Selesai',
      source: 'Dari percakapan Design Team'
    }
  ];

  // --- STATE ---
  const state = {
    currentScreen: 'screen-onboarding',
    previousScreen: null,
    isModalOpen: false,
    phoneNumber: '81572062336',
    otpCode: ['', '', '', '', '', ''],
    currentOtpIndex: 0,
    isShiftActive: false,
    resendCountdown: 60,
    resendInterval: null,
    tasks: initialTasks.map(task => ({ ...task })),
    nextTaskId: initialTasks.length + 1,
    pendingTaskSource: '',
    memberCount: 8,
    plan: 'Plus',
    isProfileModalOpen: false,
    activeChatName: 'Design Team',
    pendingPlan: null,
    savedMessages: [],
    nextMessageId: 1,
    notificationsEnabled: true,
    readReceiptsEnabled: true
  };

  // --- DOM ELEMENTS ---
  const screens = document.querySelectorAll('.app-screen');
  const navTabs = document.querySelectorAll('.nav-tab');
  const phoneModal = document.getElementById('phoneConfirmModal');
  const phoneInput = document.getElementById('phoneNumberInput');
  const modalPhoneDisplay = document.getElementById('modalPhoneDisplay');
  const verifyTargetPhone = document.getElementById('verifyTargetPhone');
  const toast = document.getElementById('appToast');
  const toastMsg = document.getElementById('toastMessage');
  const deviceFrame = document.getElementById('deviceFrame');
  const statusClock = document.getElementById('statusClock');
  const otpBoxes = document.querySelectorAll('.otp-box');
  const resendLabel = document.getElementById('resendLabel');
  const mobileTaskList = document.getElementById('mobileTaskList');
  const deskTaskList = document.getElementById('deskTaskList');
  const taskModal = document.getElementById('taskModal');
  const taskForm = document.getElementById('taskForm');
  const taskTitleInput = document.getElementById('taskTitleInput');
  const taskAssigneeInput = document.getElementById('taskAssigneeInput');
  const taskDueInput = document.getElementById('taskDueInput');
  const taskStatusInput = document.getElementById('taskStatusInput');
  const taskSourceNote = document.getElementById('taskSourceNote');
  const inviteModal = document.getElementById('inviteModal');
  const inviteForm = document.getElementById('inviteForm');
  const inviteEmailInput = document.getElementById('inviteEmailInput');
  const inviteCapacityNote = document.getElementById('inviteCapacityNote');
  const mobileSavedList = document.getElementById('mobileSavedList');
  const deskSavedList = document.getElementById('deskSavedList');
  const planModal = document.getElementById('planModal');
  const paymentModal = document.getElementById('paymentModal');
  const paymentForm = document.getElementById('paymentForm');
  const conversationModal = document.getElementById('conversationModal');
  const conversationForm = document.getElementById('conversationForm');
  const conversationNameInput = document.getElementById('conversationNameInput');
  const conversationTypeInput = document.getElementById('conversationTypeInput');
  const profileModal = document.getElementById('profileModal');
  const settingsModal = document.getElementById('settingsModal');
  const archiveModal = document.getElementById('archiveModal');
  const chatActionMenu = document.getElementById('chatActionMenu');
  const threadActionMenu = document.getElementById('threadActionMenu');

  // --- CLOCK IN STATUS BAR ---
  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    if (statusClock) statusClock.textContent = `${hours}:${minutes}`;
  }
  updateClock();
  setInterval(updateClock, 30000);

  // --- TOAST HELPER ---
  let toastTimer = null;
  function showToast(message, duration = 2500) {
    if (!toast) return;
    toastMsg.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  function filterItems(input, selector) {
    const query = input.value.trim().toLocaleLowerCase();
    document.querySelectorAll(selector).forEach(item => {
      item.hidden = !item.textContent.toLocaleLowerCase().includes(query);
    });
  }

  function filterMessages(input, selector) {
    const query = input.value.trim().toLocaleLowerCase();
    document.querySelectorAll(selector).forEach(message => {
      message.hidden = !message.textContent.toLocaleLowerCase().includes(query);
    });
  }

  function insertText(inputId, text) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    input.setRangeText(text, start, end, 'end');
    input.focus();
  }

  function formatTaskDate(value) {
    if (!value) return 'Belum ditentukan';
    const date = new Date(`${value}T00:00:00`);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  function renderTaskLists() {
    const activeCount = state.tasks.filter(task => task.status !== 'Selesai').length;
    const cards = state.tasks.map(task => `
      <article class="task-card" data-task-id="${task.id}">
        <div class="task-card-top">
          <div>
            <h3>${escapeHtml(task.title)}</h3>
            <p class="task-source">${escapeHtml(task.source)}</p>
          </div>
          <select class="task-status-select" data-task-status data-status="${escapeHtml(task.status)}" aria-label="Status tugas ${escapeHtml(task.title)}">
            ${['Belum dimulai', 'Sedang dikerjakan', 'Selesai'].map(status => `
              <option value="${status}" ${task.status === status ? 'selected' : ''}>${status}</option>
            `).join('')}
          </select>
        </div>
        <div class="task-meta">
          <span>◉ ${escapeHtml(task.assignee)}</span>
          <span>◷ Tenggat ${formatTaskDate(task.dueDate)}</span>
        </div>
      </article>
    `).join('');

    [mobileTaskList, deskTaskList].forEach(list => {
      if (list) {
        list.innerHTML = cards || '<p class="task-empty-state">Belum ada tugas. Buat tugas dari pesan atau tambahkan tugas baru.</p>';
      }
    });

    const mobileActiveCount = document.getElementById('mobileActiveTaskCount');
    const mobileTaskCount = document.getElementById('mobileTaskCount');
    const deskActiveTaskCount = document.getElementById('deskActiveTaskCount');
    const deskTaskCount = document.getElementById('deskTaskCount');
    const deskTaskBadge = document.querySelector('#deskTasksBtn span');
    if (mobileActiveCount) mobileActiveCount.textContent = String(activeCount);
    if (mobileTaskCount) mobileTaskCount.textContent = `${state.tasks.length} tugas`;
    if (deskActiveTaskCount) deskActiveTaskCount.textContent = String(activeCount);
    if (deskTaskCount) deskTaskCount.textContent = `${state.tasks.length} tugas`;
    if (deskTaskBadge) deskTaskBadge.textContent = String(activeCount);
  }

  function openTaskModal(source = '') {
    if (!taskModal || !taskForm) return;
    state.pendingTaskSource = source;
    taskForm.reset();
    taskTitleInput.value = source.slice(0, 100);
    taskDueInput.value = dateInDays(1);
    taskSourceNote.textContent = source ? `Dibuat dari pesan: “${source}”` : '';
    taskSourceNote.hidden = !source;
    taskModal.setAttribute('aria-hidden', 'false');
    taskTitleInput.focus();
  }

  function closeTaskModal() {
    if (!taskModal) return;
    taskModal.setAttribute('aria-hidden', 'true');
    state.pendingTaskSource = '';
  }

  function openInviteModal() {
    if (!inviteModal) return;
    if (state.plan === 'Free') {
      showToast('Paket Free digunakan perorangan. Pilih Plus atau Pro untuk mengundang tim.');
      return;
    }
    if (state.plan === 'Plus' && state.memberCount >= 10) {
      showToast('Batas Paket Plus sudah tercapai (10 anggota)');
      return;
    }
    inviteCapacityNote.textContent = state.plan === 'Plus'
      ? `${state.memberCount} dari 10 anggota terpakai. Paket Plus mendukung hingga 10 pengguna per tim.`
      : `Paket Pro menyediakan kapasitas lebih tinggi. Batas anggota Pro belum ditetapkan pada proposal.`;
    inviteForm.reset();
    inviteModal.setAttribute('aria-hidden', 'false');
    inviteEmailInput.focus();
  }

  function closeInviteModal() {
    if (inviteModal) inviteModal.setAttribute('aria-hidden', 'true');
  }

  function updateMemberCount() {
    const headerCount = document.getElementById('deskHeaderMemberCount');
    const footerCount = document.getElementById('deskMemberCount');
    const progress = document.getElementById('deskMemberProgress');
    const mobileStatus = document.querySelector('.chatroom-status');
    if (headerCount) headerCount.textContent = `${state.memberCount} anggota, 5 online`;
    if (footerCount) footerCount.textContent = state.plan === 'Plus'
      ? `${state.memberCount}/10 anggota`
      : state.plan === 'Free' ? 'Perorangan' : `${state.memberCount} anggota`;
    if (progress) {
      progress.style.width = `${Math.min(state.memberCount / 10 * 100, 100)}%`;
      progress.parentElement.hidden = state.plan !== 'Plus';
    }
    if (mobileStatus) mobileStatus.textContent = `${state.memberCount} anggota, 5 online`;
  }

  function updatePlanUI() {
    const badge = document.getElementById('deskCurrentPlanBadge');
    const summary = document.getElementById('deskPlanSummary');
    const quotaMode = document.querySelector('.quota-mode');
    const inviteBtn = document.getElementById('deskInviteBtn');
    const profilePlan = document.getElementById('profilePlan');
    if (badge) badge.textContent = state.plan;
    if (summary) {
      const dot = summary.querySelector('.dot-green');
      summary.textContent = '';
      if (dot) summary.appendChild(dot);
      summary.append(` Design Team · Paket ${state.plan}`);
    }
    if (quotaMode) {
      quotaMode.textContent = state.plan === 'Plus'
        ? 'Batas anggota: 10 pengguna'
        : state.plan === 'Free' ? 'Paket perorangan' : 'Batas Pro ditetapkan setelah uji kapasitas';
    }
    if (inviteBtn) inviteBtn.disabled = state.plan === 'Free';
    if (profilePlan) profilePlan.textContent = state.plan;
    document.querySelectorAll('[data-select-plan]').forEach(button => {
      const active = button.getAttribute('data-select-plan') === state.plan;
      button.textContent = active ? `Paket aktif · ${state.plan}` : `Pilih ${button.getAttribute('data-select-plan')}`;
      button.disabled = active;
    });
    updateMemberCount();
  }

  function openPlanModal() {
    if (!planModal) return;
    updatePlanUI();
    planModal.setAttribute('aria-hidden', 'false');
  }

  function closePlanModal() {
    if (planModal) planModal.setAttribute('aria-hidden', 'true');
  }

  function closePaymentModal() {
    if (paymentModal) paymentModal.setAttribute('aria-hidden', 'true');
    state.pendingPlan = null;
  }

  function openConversationModal() {
    if (!conversationModal || !conversationForm) return;
    conversationForm.reset();
    conversationModal.setAttribute('aria-hidden', 'false');
    conversationTypeInput.focus();
  }

  function closeConversationModal() {
    if (conversationModal) conversationModal.setAttribute('aria-hidden', 'true');
  }

  function openProfileModal() {
    const profilePhone = document.getElementById('profilePhone');
    const profilePlan = document.getElementById('profilePlan');
    if (profilePhone) profilePhone.textContent = `+62 ${formatPhoneNumber(state.phoneNumber)}`;
    if (profilePlan) profilePlan.textContent = state.plan;
    if (profileModal) {
      state.isProfileModalOpen = true;
      profileModal.setAttribute('aria-hidden', 'false');
      updateToolbarTabs(state.currentScreen);
    }
  }

  function closeProfileModal() {
    if (profileModal) {
      state.isProfileModalOpen = false;
      profileModal.setAttribute('aria-hidden', 'true');
      updateToolbarTabs(state.currentScreen, state.isModalOpen);
    }
  }

  function openSettingsModal() {
    if (!settingsModal) return;
    closeProfileModal();
    settingsModal.setAttribute('aria-hidden', 'false');
  }

  function closeSettingsModal() {
    if (settingsModal) settingsModal.setAttribute('aria-hidden', 'true');
  }

  function renderSavedMessages() {
    const cards = state.savedMessages.map(message => `
      <article class="saved-message-card">
        <div class="saved-message-heading">
          <strong>${escapeHtml(message.chat)}</strong>
          <button type="button" class="saved-remove-btn" data-remove-saved="${message.id}" aria-label="Hapus pesan tersimpan">Hapus</button>
        </div>
        <p>${escapeHtml(message.text)}</p>
        <span>Disimpan dari percakapan</span>
      </article>
    `).join('');
    const emptyState = '<p class="saved-empty-state">Belum ada pesan tersimpan. Gunakan tombol “Simpan pesan” pada chat untuk menyimpannya di sini.</p>';
    [mobileSavedList, deskSavedList].forEach(list => {
      if (list) list.innerHTML = cards || emptyState;
    });
    const mobileCount = document.getElementById('mobileSavedCount');
    if (mobileCount) mobileCount.textContent = String(state.savedMessages.length);
    document.querySelectorAll('[data-save-message]').forEach(button => {
      const isSaved = state.savedMessages.some(message => message.key === button.getAttribute('data-save-key'));
      button.classList.toggle('is-saved', isSaved);
      button.textContent = isSaved ? '★ Tersimpan' : '☆ Simpan pesan';
    });
  }

  function toggleSavedMessage(button) {
    const key = button.getAttribute('data-save-key') || `saved-${state.nextMessageId++}`;
    const existing = state.savedMessages.findIndex(message => message.key === key);
    if (existing >= 0) {
      state.savedMessages.splice(existing, 1);
      showToast('Pesan dihapus dari daftar tersimpan');
    } else {
      state.savedMessages.push({
        id: state.nextMessageId++,
        key,
        chat: button.getAttribute('data-save-chat') || 'Design Team',
        text: button.getAttribute('data-save-text') || ''
      });
      showToast('Pesan disimpan');
    }
    renderSavedMessages();
  }

  function removeSavedMessage(id) {
    state.savedMessages = state.savedMessages.filter(message => String(message.id) !== String(id));
    renderSavedMessages();
    showToast('Pesan dihapus dari daftar tersimpan');
  }

  function createConversation(name, type) {
    const row = document.createElement('div');
    row.className = 'chat-row action-btn-area user-created-conversation';
    row.setAttribute('data-user-created', 'true');
    row.setAttribute('data-category', type === 'Pribadi' ? 'directs' : type === 'Grup Divisi' ? 'channels' : 'work');
    const avatar = document.createElement('div');
    avatar.className = 'avatar-box avatar-circle bg-emerald';
    avatar.textContent = name.trim().slice(0, 2).toUpperCase();
    const info = document.createElement('div');
    info.className = 'chat-main-info';
    const top = document.createElement('div');
    top.className = 'chat-row-top';
    const title = document.createElement('span');
    title.className = 'chat-sender-name font-bold';
    title.textContent = name.trim();
    top.appendChild(title);
    const bottom = document.createElement('div');
    bottom.className = 'chat-row-bottom';
    const snippet = document.createElement('span');
    snippet.className = 'chat-snippet';
    snippet.textContent = `${type} · Percakapan baru`;
    bottom.appendChild(snippet);
    info.append(top, bottom);
    row.append(avatar, info);
    const mobileList = document.querySelector('.chatlist-body');
    if (mobileList) mobileList.prepend(row);

    const deskRow = document.createElement('div');
    deskRow.className = 'desk-chat-item user-created-conversation';
    deskRow.setAttribute('data-user-created', 'true');
    deskRow.setAttribute('data-category', type === 'Pribadi' ? 'directs' : type === 'Grup Divisi' ? 'channels' : 'work');
    const deskAvatar = document.createElement('div');
    deskAvatar.className = 'desk-avatar bg-emerald';
    deskAvatar.textContent = name.trim().slice(0, 2).toUpperCase();
    const deskMeta = document.createElement('div');
    deskMeta.className = 'desk-chat-meta';
    const deskTop = document.createElement('div');
    deskTop.className = 'desk-chat-top';
    const deskName = document.createElement('span');
    deskName.className = 'desk-name font-bold';
    deskName.textContent = name.trim();
    deskTop.appendChild(deskName);
    const deskBottom = document.createElement('div');
    deskBottom.className = 'desk-chat-bottom';
    const deskPreview = document.createElement('span');
    deskPreview.className = 'desk-preview';
    deskPreview.textContent = `${type} · Percakapan baru`;
    deskBottom.appendChild(deskPreview);
    deskMeta.append(deskTop, deskBottom);
    deskRow.append(deskAvatar, deskMeta);
    const deskList = document.querySelector('.desk-chat-list');
    if (deskList) deskList.prepend(deskRow);
  }

  function updateActiveChatName() {
    const mobileName = document.querySelector('.chatroom-name');
    const desktopName = document.querySelector('.desk-header-title');
    if (mobileName) mobileName.textContent = state.activeChatName;
    if (desktopName) desktopName.textContent = state.activeChatName;
  }

  document.querySelectorAll('[data-open-task-modal]').forEach(button => {
    button.addEventListener('click', () => openTaskModal());
  });

  document.addEventListener('click', event => {
    const menuAction = event.target.closest('[data-menu-action]');
    if (menuAction) {
      const action = menuAction.getAttribute('data-menu-action');
      chatActionMenu.hidden = true;
      threadActionMenu.hidden = true;
      document.querySelectorAll('[aria-expanded="true"]').forEach(button => button.setAttribute('aria-expanded', 'false'));
      if (action === 'tasks') {
        navigateTo('screen-tasks');
      } else if (action === 'saved') {
        navigateTo('screen-saved');
      } else if (action === 'invite') {
        openInviteModal();
      } else if (action === 'profile') {
        openProfileModal();
      } else if (action === 'archive') {
        archiveModal.setAttribute('aria-hidden', 'false');
      } else if (action === 'plans') {
        openPlanModal();
      } else if (action === 'thread-task') {
        openTaskModal('Tindak lanjut dari thread Design Team');
      } else if (action === 'thread-save') {
        document.querySelector('[data-save-key="design-root-thread"]')?.click();
      }
      return;
    }

    if (event.target.closest('[data-open-profile]')) {
      openProfileModal();
      return;
    }

    const threadTaskButton = event.target.closest('[data-create-thread-task]');
    if (threadTaskButton) {
      openTaskModal('Tindak lanjut dari thread Design Team');
      return;
    }

    const archiveChat = event.target.closest('[data-open-archived-chat]');
    if (archiveChat) {
      state.activeChatName = archiveChat.getAttribute('data-open-archived-chat');
      closeArchiveModal();
      updateActiveChatName();
      navigateTo('screen-chat-room');
      showToast(`Membuka arsip ${state.activeChatName}`);
      return;
    }

    const reaction = event.target.closest('[data-reaction]');
    if (reaction) {
      const current = Number(reaction.textContent.match(/\d+/)?.[0] || 0);
      const active = reaction.getAttribute('aria-pressed') === 'true';
      reaction.textContent = `${reaction.getAttribute('data-reaction')} ${Math.max(0, current + (active ? -1 : 1))}`;
      reaction.setAttribute('aria-pressed', String(!active));
      return;
    }

    const emojiButton = event.target.closest('[data-insert-emoji]');
    if (emojiButton) {
      insertText(emojiButton.getAttribute('data-insert-emoji'), '😊');
      return;
    }

    const fileButton = event.target.closest('[data-choose-file]');
    if (fileButton) {
      document.getElementById(fileButton.getAttribute('data-choose-file'))?.click();
      return;
    }

    const voiceButton = event.target.closest('[data-voice-note]');
    if (voiceButton) {
      insertText(voiceButton.getAttribute('data-voice-note'), '[Pesan suara demo]');
      showToast('Catatan suara demo ditambahkan ke kolom pesan.');
      return;
    }

    const closeSearch = event.target.closest('[data-close-message-search]');
    if (closeSearch) {
      const mode = closeSearch.getAttribute('data-close-message-search');
      const bar = document.getElementById(mode === 'mobile' ? 'mobileMessageSearchBar' : 'deskMessageSearchBar');
      const input = document.getElementById(mode === 'mobile' ? 'mobileMessageSearchInput' : 'deskMessageSearchInput');
      if (bar) bar.hidden = true;
      if (input) {
        input.value = '';
        filterMessages(input, mode === 'mobile' ? '.chatroom-body .msg-bubble-wrap' : '.desk-chat-body .desk-msg-row');
      }
      return;
    }

    const removeButton = event.target.closest('[data-remove-saved]');
    if (removeButton) {
      removeSavedMessage(removeButton.getAttribute('data-remove-saved'));
      return;
    }

    const saveButton = event.target.closest('[data-save-message]');
    if (saveButton) {
      toggleSavedMessage(saveButton);
      return;
    }

    const taskButton = event.target.closest('[data-create-task]');
    if (taskButton) openTaskModal(taskButton.getAttribute('data-task-source') || '');
  });

  function closeArchiveModal() {
    if (archiveModal) archiveModal.setAttribute('aria-hidden', 'true');
  }

  if (archiveModal) {
    archiveModal.addEventListener('click', event => {
      if (event.target === archiveModal) closeArchiveModal();
    });
  }
  const closeArchiveModalBtn = document.getElementById('closeArchiveModal');
  if (closeArchiveModalBtn) closeArchiveModalBtn.addEventListener('click', closeArchiveModal);

  document.querySelectorAll('[data-choose-file]').forEach(button => {
    const fileInput = document.getElementById(button.getAttribute('data-choose-file'));
    if (!fileInput) return;
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      const targetInputId = fileInput.id === 'mobileAttachmentInput' ? 'mainChatInput' : 'deskMainInput';
      insertText(targetInputId, `[Lampiran: ${file.name}]`);
      showToast(`Lampiran demo ditambahkan: ${file.name}`);
      fileInput.value = '';
    });
  });

  const closeTaskModalBtn = document.getElementById('closeTaskModal');
  const cancelTaskModalBtn = document.getElementById('cancelTaskModal');
  if (closeTaskModalBtn) closeTaskModalBtn.addEventListener('click', closeTaskModal);
  if (cancelTaskModalBtn) cancelTaskModalBtn.addEventListener('click', closeTaskModal);
  if (taskModal) {
    taskModal.addEventListener('click', event => {
      if (event.target === taskModal) closeTaskModal();
    });
  }

  if (taskForm) {
    taskForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!taskForm.reportValidity()) return;
      const title = taskTitleInput.value.trim();
      if (!title) {
        taskTitleInput.setCustomValidity('Judul tugas wajib diisi.');
        taskTitleInput.reportValidity();
        taskTitleInput.setCustomValidity('');
        return;
      }

      state.tasks.unshift({
        id: state.nextTaskId++,
        title,
        assignee: taskAssigneeInput.value,
        dueDate: taskDueInput.value,
        status: taskStatusInput.value,
        source: state.pendingTaskSource ? 'Dari pesan Design Team' : 'Dibuat dari daftar tugas'
      });
      renderTaskLists();
      closeTaskModal();
      showToast('Tugas berhasil ditambahkan');
    });
  }

  [mobileTaskList, deskTaskList].forEach(list => {
    if (!list) return;
    list.addEventListener('change', event => {
      const select = event.target.closest('[data-task-status]');
      if (!select) return;
      const card = select.closest('[data-task-id]');
      const task = state.tasks.find(item => String(item.id) === card?.getAttribute('data-task-id'));
      if (!task) return;
      task.status = select.value;
      renderTaskLists();
      showToast('Status tugas diperbarui');
    });
  });

  const deskInviteBtn = document.getElementById('deskInviteBtn');
  const mobileInviteBtn = document.getElementById('mobileInviteBtn');
  const closeInviteModalBtn = document.getElementById('closeInviteModal');
  const cancelInviteModalBtn = document.getElementById('cancelInviteModal');
  if (deskInviteBtn) deskInviteBtn.addEventListener('click', openInviteModal);
  if (mobileInviteBtn) mobileInviteBtn.addEventListener('click', openInviteModal);
  if (closeInviteModalBtn) closeInviteModalBtn.addEventListener('click', closeInviteModal);
  if (cancelInviteModalBtn) cancelInviteModalBtn.addEventListener('click', closeInviteModal);
  if (inviteModal) {
    inviteModal.addEventListener('click', event => {
      if (event.target === inviteModal) closeInviteModal();
    });
  }
  if (inviteForm) {
    inviteForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!inviteForm.reportValidity()) return;
      if (state.plan === 'Plus' && state.memberCount >= 10) {
        closeInviteModal();
        showToast('Batas Paket Plus sudah tercapai (10 anggota)');
        return;
      }

      const invitedEmail = inviteEmailInput.value.trim();
      state.memberCount++;
      updateMemberCount();
      closeInviteModal();
      showToast(`Undangan simulasi dibuat untuk ${invitedEmail}`);
    });
  }

  const planButtons = document.querySelectorAll('[data-select-plan]');
  planButtons.forEach(button => {
    button.addEventListener('click', () => {
      const selectedPlan = button.getAttribute('data-select-plan');
      if (selectedPlan === state.plan) {
        closePlanModal();
        return;
      }
      if (selectedPlan === 'Free' && state.memberCount > 1) {
        showToast('Paket Free untuk perorangan. Keluarkan anggota tim sebelum beralih.');
        return;
      }
      if (selectedPlan === 'Free') {
        state.plan = 'Free';
        closePlanModal();
        updatePlanUI();
        showToast('Paket Free aktif');
        return;
      }

      state.pendingPlan = selectedPlan;
      document.getElementById('paymentPlanName').textContent = `Paket ${selectedPlan}`;
      document.getElementById('paymentPlanPrice').textContent = selectedPlan === 'Plus'
        ? 'Rp29.000 / tim / bulan'
        : 'Rp59.000 / tim / bulan';
      closePlanModal();
      paymentModal.setAttribute('aria-hidden', 'false');
    });
  });

  const deskPlanBtn = document.getElementById('deskPlanBtn');
  const closePlanModalBtn = document.getElementById('closePlanModal');
  const closeProfileModalBtn = document.getElementById('closeProfileModal');
  const profileManagePlanBtn = document.getElementById('profileManagePlanBtn');
  const profileSettingsBtn = document.getElementById('profileSettingsBtn');
  const closeSettingsModalBtn = document.getElementById('closeSettingsModal');
  const settingsNotificationsToggle = document.getElementById('settingsNotificationsToggle');
  const settingsReadReceiptsToggle = document.getElementById('settingsReadReceiptsToggle');
  if (deskPlanBtn) deskPlanBtn.addEventListener('click', openPlanModal);
  if (closePlanModalBtn) closePlanModalBtn.addEventListener('click', closePlanModal);
  if (closeProfileModalBtn) closeProfileModalBtn.addEventListener('click', closeProfileModal);
  if (profileManagePlanBtn) profileManagePlanBtn.addEventListener('click', () => {
    closeProfileModal();
    openPlanModal();
  });
  if (profileSettingsBtn) profileSettingsBtn.addEventListener('click', openSettingsModal);
  if (closeSettingsModalBtn) closeSettingsModalBtn.addEventListener('click', closeSettingsModal);
  if (settingsModal) {
    settingsModal.addEventListener('click', event => {
      if (event.target === settingsModal) closeSettingsModal();
    });
  }
  if (settingsNotificationsToggle) {
    settingsNotificationsToggle.addEventListener('change', () => {
      state.notificationsEnabled = settingsNotificationsToggle.checked;
      showToast(state.notificationsEnabled ? 'Preferensi notifikasi diaktifkan.' : 'Preferensi notifikasi dimatikan.');
    });
  }
  if (settingsReadReceiptsToggle) {
    settingsReadReceiptsToggle.addEventListener('change', () => {
      state.readReceiptsEnabled = settingsReadReceiptsToggle.checked;
      showToast(state.readReceiptsEnabled ? 'Tanda pesan dibaca diaktifkan.' : 'Tanda pesan dibaca dimatikan.');
    });
  }
  if (profileModal) {
    profileModal.addEventListener('click', event => {
      if (event.target === profileModal) closeProfileModal();
    });
  }
  if (planModal) {
    planModal.addEventListener('click', event => {
      if (event.target === planModal) closePlanModal();
    });
  }

  const closePaymentModalBtn = document.getElementById('closePaymentModal');
  const cancelPaymentModalBtn = document.getElementById('cancelPaymentModal');
  if (closePaymentModalBtn) closePaymentModalBtn.addEventListener('click', closePaymentModal);
  if (cancelPaymentModalBtn) cancelPaymentModalBtn.addEventListener('click', () => {
    closePaymentModal();
    openPlanModal();
  });
  if (paymentModal) {
    paymentModal.addEventListener('click', event => {
      if (event.target === paymentModal) closePaymentModal();
    });
  }
  if (paymentForm) {
    paymentForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!state.pendingPlan) return;
      const method = paymentForm.querySelector('input[name="paymentMethod"]:checked')?.value || 'QRIS';
      state.plan = state.pendingPlan;
      state.pendingPlan = null;
      closePaymentModal();
      updatePlanUI();
      showToast(`Simulasi pembayaran ${method} berhasil. Paket ${state.plan} aktif.`);
    });
  }

  const btnPencilWrite = document.getElementById('btnPencilWrite');
  const deskNewConversationBtn = document.getElementById('deskNewConversationBtn');
  const closeConversationModalBtn = document.getElementById('closeConversationModal');
  const cancelConversationModalBtn = document.getElementById('cancelConversationModal');
  if (btnPencilWrite) btnPencilWrite.addEventListener('click', openConversationModal);
  if (deskNewConversationBtn) deskNewConversationBtn.addEventListener('click', openConversationModal);
  if (closeConversationModalBtn) closeConversationModalBtn.addEventListener('click', closeConversationModal);
  if (cancelConversationModalBtn) cancelConversationModalBtn.addEventListener('click', closeConversationModal);
  if (conversationModal) {
    conversationModal.addEventListener('click', event => {
      if (event.target === conversationModal) closeConversationModal();
    });
  }
  if (conversationForm) {
    conversationForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!conversationForm.reportValidity()) return;
      const name = conversationNameInput.value.trim();
      const type = conversationTypeInput.value;
      if (!name) return;
      if (state.plan === 'Free' && type !== 'Pribadi') {
        showToast('Paket Free hanya untuk penggunaan perorangan. Upgrade untuk membuat ruang tim.');
        return;
      }
      createConversation(name, type);
      closeConversationModal();
      showToast(`Percakapan ${name} dibuat`);
    });
  }

  renderTaskLists();
  renderSavedMessages();
  updatePlanUI();
  updateMemberCount();

  // --- SCREEN NAVIGATION CONTROLLER ---
  function navigateTo(targetScreenId, options = {}) {
    const targetScreen = document.getElementById(targetScreenId);
    if (!targetScreen) return;

    const focusedScreen = document.activeElement?.closest('.app-screen');
    if (focusedScreen && focusedScreen !== targetScreen) document.activeElement.blur();

    // Close modal if open
    closePhoneModal();
    if (state.isProfileModalOpen) closeProfileModal();

    // Set screen transition classes
    screens.forEach(screen => {
      if (screen.id === targetScreenId) {
        screen.classList.remove('slide-out-left');
        screen.classList.add('active');
      } else if (screen.classList.contains('active')) {
        screen.classList.add('slide-out-left');
        screen.classList.remove('active');
        setTimeout(() => {
          screen.classList.remove('slide-out-left');
        }, 350);
      } else {
        screen.classList.remove('active', 'slide-out-left');
      }
    });

    const screensViewport = document.querySelector('.screens-viewport');
    if (screensViewport) {
      screensViewport.scrollLeft = 0;
      setTimeout(() => { screensViewport.scrollLeft = 0; }, 350);
    }

    state.previousScreen = state.currentScreen;
    state.currentScreen = targetScreenId;

    // Manage Desktop Workspace view (Foto 3 & Foto 4)
    const deskThreadPanel = document.getElementById('deskThreadPanel');
    if (targetScreenId === 'screen-chat-list' || targetScreenId === 'screen-chat-room' || targetScreenId === 'screen-thread' || targetScreenId === 'screen-tasks' || targetScreenId === 'screen-saved') {
      document.body.classList.add('in-chat-flow');
      const deskChatMain = document.querySelector('.desk-chat-main');
      if (deskChatMain) deskChatMain.classList.toggle('tasks-open', targetScreenId === 'screen-tasks');
      if (deskChatMain) deskChatMain.classList.toggle('saved-open', targetScreenId === 'screen-saved');
      const deskTasksBtn = document.getElementById('deskTasksBtn');
      if (deskTasksBtn) deskTasksBtn.setAttribute('aria-pressed', String(targetScreenId === 'screen-tasks'));
      if (targetScreenId === 'screen-thread') {
        if (deskThreadPanel) deskThreadPanel.classList.add('open');
      } else {
        if (deskThreadPanel) deskThreadPanel.classList.remove('open');
      }
    } else {
      document.body.classList.remove('in-chat-flow');
    }

    // Sync presentation toolbar tabs
    updateToolbarTabs(targetScreenId, options.isModal);

    // Sync input values to text displays
    syncStateToUI();

    // Trigger specific screen setups
    if (targetScreenId === 'screen-verify') {
      startResendCountdown();
    }
  }

  function updateToolbarTabs(screenId, isModal = false) {
    navTabs.forEach(tab => {
      const target = tab.getAttribute('data-target');
      const requiresModal = tab.getAttribute('data-modal') === 'true';
      const isProfileTab = tab.getAttribute('data-action') === 'profile';
      const active = state.isProfileModalOpen
        ? isProfileTab
        : isModal
          ? requiresModal
          : target === screenId && !requiresModal && !isProfileTab;

      tab.classList.toggle('active', active);
    });
  }

  function syncStateToUI() {
    if (phoneInput) phoneInput.value = state.phoneNumber;
    if (modalPhoneDisplay) {
      modalPhoneDisplay.textContent = `+62 ${formatPhoneNumber(state.phoneNumber)}`;
    }
    if (verifyTargetPhone) verifyTargetPhone.textContent = `+62 ${formatPhoneNumber(state.phoneNumber)}`;
    if (profileModal?.getAttribute('aria-hidden') === 'false') {
      const profilePhone = document.getElementById('profilePhone');
      if (profilePhone) profilePhone.textContent = `+62 ${formatPhoneNumber(state.phoneNumber)}`;
    }
  }

  function formatPhoneNumber(num) {
    if (!num) return '';
    return [num.slice(0, 3), num.slice(3, 6), num.slice(6)].filter(Boolean).join(' ');
  }

  // --- MODAL CONTROLLER (Screen 3) ---
  function openPhoneModal() {
    if (state.phoneNumber.length < 8) {
      showToast('Masukkan nomor telepon yang valid (minimal 8 digit).');
      return;
    }
    state.isModalOpen = true;
    syncStateToUI();
    phoneModal.classList.add('show');
    updateToolbarTabs('screen-phone', true);
  }

  function closePhoneModal() {
    state.isModalOpen = false;
    phoneModal.classList.remove('show');
    if (state.currentScreen === 'screen-phone') {
      updateToolbarTabs('screen-phone', false);
    }
  }

  // --- ATTACH ACTION BUTTON AREA CLICK HANDLERS ---

  // 1. All elements with [data-next]
  document.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetScreen = btn.getAttribute('data-next');
      navigateTo(targetScreen);
    });
  });

  // 2. Phone Screen Next (Opens modal)
  const btnPhoneNext = document.getElementById('btnPhoneNext');
  if (btnPhoneNext) {
    btnPhoneNext.addEventListener('click', (e) => {
      e.preventDefault();
      openPhoneModal();
    });
  }

  // 3. Modal Actions
  const modalBtnEdit = document.getElementById('modalBtnEdit');
  if (modalBtnEdit) {
    modalBtnEdit.addEventListener('click', (e) => {
      e.preventDefault();
      closePhoneModal();
      showToast('Silakan ubah nomor telepon Anda');
    });
  }

  const modalBtnConfirm = document.getElementById('modalBtnConfirm');
  if (modalBtnConfirm) {
    modalBtnConfirm.addEventListener('click', (e) => {
      e.preventDefault();
      closePhoneModal();
      state.otpCode = ['', '', '', '', '', ''];
      state.currentOtpIndex = 0;
      updateOtpUI();
      navigateTo('screen-verify');
    });
  }

  // Close modal when clicking outside card
  phoneModal.addEventListener('click', (e) => {
    if (e.target === phoneModal) {
      closePhoneModal();
    }
  });

  // Clear phone button
  const clearPhoneBtn = document.getElementById('clearPhoneBtn');
  if (clearPhoneBtn) {
    clearPhoneBtn.addEventListener('click', () => {
      state.phoneNumber = '';
      syncStateToUI();
      showToast('Nomor telepon dikosongkan');
    });
  }

  // Resend code action
  const resendCodeBtn = document.getElementById('resendCodeBtn');
  if (resendCodeBtn) {
    resendCodeBtn.addEventListener('click', () => {
      if (state.resendCountdown <= 0) {
        startResendCountdown();
        state.otpCode = ['', '', '', '', '', ''];
        state.currentOtpIndex = 0;
        updateOtpUI();
        showToast(`Simulasi: permintaan kode SMS baru untuk +62 ${formatPhoneNumber(state.phoneNumber)}.`);
      } else {
        showToast(`Mohon tunggu ${state.resendCountdown} detik sebelum mengirim ulang.`);
      }
    });
  }

  function startResendCountdown() {
    clearInterval(state.resendInterval);
    state.resendCountdown = 60;
    updateResendText();
    state.resendInterval = setInterval(() => {
      state.resendCountdown--;
      if (state.resendCountdown <= 0) {
        clearInterval(state.resendInterval);
        if (resendLabel) resendLabel.textContent = 'Kirim ulang sekarang';
      } else {
        updateResendText();
      }
    }, 1000);
  }

  function updateResendText() {
    if (resendLabel) {
      resendLabel.textContent = `Kirim ulang (${state.resendCountdown}s)`;
    }
  }

  // --- SOFT KEYPAD: PHONE NUMBER (NUMERIC) ---
  const phoneKeypad = document.getElementById('phoneKeypad');
  if (phoneKeypad) {
    phoneKeypad.addEventListener('click', (e) => {
      const keyBtn = e.target.closest('.keypad-key');
      if (!keyBtn) return;

      const digit = keyBtn.getAttribute('data-digit');
      if (digit !== null) {
        if (state.phoneNumber.length < 15) {
          state.phoneNumber += digit;
          syncStateToUI();
        }
      }
    });

    const phoneBackspaceBtn = document.getElementById('phoneBackspaceBtn');
    if (phoneBackspaceBtn) {
      phoneBackspaceBtn.addEventListener('click', () => {
        if (state.phoneNumber.length > 0) {
          state.phoneNumber = state.phoneNumber.slice(0, -1);
          syncStateToUI();
        }
      });
    }

  }

  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      let digits = phoneInput.value.replace(/\D/g, '');
      if (digits.startsWith('62')) digits = digits.slice(2);
      if (digits.startsWith('0')) digits = digits.slice(1);
      state.phoneNumber = digits.slice(0, 15);
      phoneInput.value = state.phoneNumber;
      syncStateToUI();
    });
  }

  const countryCodeCard = document.getElementById('countryCodeCard');
  if (countryCodeCard) {
    const showCountryNotice = () => showToast('Untuk demo ini, negara yang tersedia adalah Indonesia (+62).');
    countryCodeCard.addEventListener('click', showCountryNotice);
    countryCodeCard.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        showCountryNotice();
      }
    });
  }

  // --- SOFT KEYPAD: OTP VERIFICATION (NUMERIC) ---
  const otpKeypad = document.getElementById('otpKeypad');
  const otpBackspaceBtn = document.getElementById('otpBackspaceBtn');

  function updateOtpUI() {
    otpBoxes.forEach((box, i) => {
      const valSpan = box.querySelector('.otp-val');
      const caret = box.querySelector('.blinking-caret');
      const val = state.otpCode[i];

      if (valSpan) valSpan.textContent = val || '';

      if (val) {
        box.classList.add('filled');
      } else {
        box.classList.remove('filled');
      }

      if (i === state.currentOtpIndex) {
        box.classList.add('active');
        if (!caret && !val) {
          const newCaret = document.createElement('span');
          newCaret.className = 'blinking-caret';
          box.appendChild(newCaret);
        }
      } else {
        box.classList.remove('active');
        if (caret) caret.remove();
      }
    });

    // Check if OTP complete
    if (state.otpCode.every(d => d !== '')) {
      setTimeout(() => {
        showToast('Kode Terverifikasi! Masuk ke CAK.APP...', 1400);
        setTimeout(() => {
          navigateTo('screen-chat-list');
        }, 600);
      }, 300);
    }
  }

  // --- CHAT LIST HANDLERS ---
  const chatlistBody = document.querySelector('.chatlist-body');
  const chatListSearchInput = document.getElementById('chatListSearchInput');
  const chatListEmpty = document.getElementById('chatListEmpty');
  const mobileChatFilters = document.querySelectorAll('[data-chat-filter]');

  function applyMobileChatFilters() {
    const activeFilter = document.querySelector('[data-chat-filter].active')?.getAttribute('data-chat-filter') || 'all';
    const query = chatListSearchInput?.value.trim().toLocaleLowerCase() || '';
    const rows = [...document.querySelectorAll('.chatlist-body .chat-row')];
    let visibleCount = 0;

    rows.forEach(row => {
      const matchesQuery = row.textContent.toLocaleLowerCase().includes(query);
      const matchesFilter = activeFilter === 'all' || row.getAttribute('data-category') === activeFilter;
      row.hidden = !matchesQuery || !matchesFilter;
      if (!row.hidden) visibleCount++;
    });

    if (chatListEmpty) chatListEmpty.hidden = visibleCount > 0;
  }

  if (chatlistBody) {
    chatlistBody.addEventListener('click', event => {
      const row = event.target.closest('.chat-row');
      if (!row) return;
      state.activeChatName = row.id === 'rowDesignTeam'
        ? 'Design Team'
        : row.querySelector('.chat-sender-name')?.textContent.trim() || 'Design Team';
      updateActiveChatName();
      navigateTo('screen-chat-room');
    });
  }

  if (chatListSearchInput) {
    chatListSearchInput.addEventListener('input', applyMobileChatFilters);
  }
  mobileChatFilters.forEach(button => {
    button.addEventListener('click', () => {
      mobileChatFilters.forEach(filter => {
        const active = filter === button;
        filter.classList.toggle('active', active);
        filter.setAttribute('aria-pressed', String(active));
      });
      applyMobileChatFilters();
    });
  });
  applyMobileChatFilters();

  const deskSearchInput = document.getElementById('deskSearchInput');
  const mobileMessageSearchInput = document.getElementById('mobileMessageSearchInput');
  if (mobileMessageSearchInput) {
    mobileMessageSearchInput.addEventListener('input', () => filterMessages(mobileMessageSearchInput, '.chatroom-body .msg-bubble-wrap'));
  }
  const deskMessageSearchInput = document.getElementById('deskMessageSearchInput');
  if (deskMessageSearchInput) {
    deskMessageSearchInput.addEventListener('input', () => filterMessages(deskMessageSearchInput, '.desk-chat-body .desk-msg-row'));
  }

  const bottomNavItems = document.querySelectorAll('.nav-bottom-item');
  bottomNavItems.forEach(item => {
    item.addEventListener('click', () => {
      bottomNavItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const label = item.querySelector('span')?.textContent || 'Menu';
      const target = item.getAttribute('data-target');
      if (target) {
        navigateTo(target);
      } else if (item.id === 'navChats') {
        navigateTo('screen-chat-list');
      } else if (item.id === 'navProfile') {
        openProfileModal();
      } else if (item.id === 'navSettings') {
        openPlanModal();
      } else {
        showToast(`Buka tab ${label}`);
      }
    });
  });

  function toggleActionMenu(menu, trigger) {
      if (!menu || !trigger) return;
      const shouldOpen = menu.hidden;
      document.querySelectorAll('.chat-action-menu').forEach(item => { item.hidden = true; });
      document.querySelectorAll('[aria-expanded="true"]').forEach(button => button.setAttribute('aria-expanded', 'false'));
      menu.hidden = !shouldOpen;
      trigger.setAttribute('aria-expanded', String(shouldOpen));
    }

  const mobileChatMenuBtn = document.getElementById('mobileChatMenuBtn');
  const mobileChatListMenuBtn = document.getElementById('mobileChatListMenuBtn');
  const deskChatMenuBtn = document.getElementById('deskChatMenuBtn');
  const mobileThreadMenuBtn = document.getElementById('mobileThreadMenuBtn');
  [mobileChatMenuBtn, mobileChatListMenuBtn, deskChatMenuBtn].forEach(button => {
    if (button) button.addEventListener('click', () => toggleActionMenu(chatActionMenu, button));
  });
  if (mobileThreadMenuBtn) {
    mobileThreadMenuBtn.addEventListener('click', () => toggleActionMenu(threadActionMenu, mobileThreadMenuBtn));
  }
  document.addEventListener('click', event => {
    if (event.target.closest('.chat-action-menu, #mobileChatMenuBtn, #mobileChatListMenuBtn, #deskChatMenuBtn, #mobileThreadMenuBtn')) return;
    document.querySelectorAll('.chat-action-menu').forEach(menu => { menu.hidden = true; });
    document.querySelectorAll('[aria-expanded="true"]').forEach(button => button.setAttribute('aria-expanded', 'false'));
  });

  const mobileMessageSearchBtn = document.getElementById('mobileMessageSearchBtn');
  const mobileMessageSearchBar = document.getElementById('mobileMessageSearchBar');
  if (mobileMessageSearchBtn && mobileMessageSearchBar) {
    mobileMessageSearchBtn.addEventListener('click', () => {
      mobileMessageSearchBar.hidden = false;
      if (mobileMessageSearchInput) mobileMessageSearchInput.focus();
    });
  }
  const deskMessageSearchBtn = document.getElementById('deskMessageSearchBtn');
  const deskMessageSearchBar = document.getElementById('deskMessageSearchBar');
  if (deskMessageSearchBtn && deskMessageSearchBar) {
    deskMessageSearchBtn.addEventListener('click', () => {
      deskMessageSearchBar.hidden = false;
      if (deskMessageSearchInput) deskMessageSearchInput.focus();
    });
  }

  const deskMenuBtn = document.getElementById('deskMenuBtn');
  if (deskMenuBtn) {
    deskMenuBtn.addEventListener('click', () => {
      const workspace = document.getElementById('desktopWorkspace');
      const collapsed = workspace.classList.toggle('sidebar-collapsed');
      deskMenuBtn.setAttribute('aria-pressed', String(collapsed));
    });
  }

  const deskVoiceCallBtn = document.getElementById('deskVoiceCallBtn');
  if (deskVoiceCallBtn) {
    deskVoiceCallBtn.addEventListener('click', () => {
      const active = deskVoiceCallBtn.getAttribute('aria-pressed') !== 'true';
      deskVoiceCallBtn.setAttribute('aria-pressed', String(active));
      showToast(active ? 'Panggilan suara demo dimulai.' : 'Panggilan suara demo diakhiri.');
    });
  }

  const downloadMockupBtn = document.getElementById('downloadMockupBtn');
  if (downloadMockupBtn) {
    downloadMockupBtn.addEventListener('click', () => {
      const contents = 'CAK.APP demo attachment\\nThe original Figma file is not included in this frontend prototype.';
      const fileUrl = URL.createObjectURL(new Blob([contents], { type: 'text/plain' }));
      const downloadLink = document.createElement('a');
      downloadLink.href = fileUrl;
      downloadLink.download = 'mockup-dashboard-v4-demo.txt';
      downloadLink.click();
      setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
      showToast('File demo berhasil diunduh.');
    });
  }

  // --- CHAT ROOM HANDLERS ---
  const mainChatInput = document.getElementById('mainChatInput');
  const btnSendMainMessage = document.getElementById('btnSendMainMessage');
  const chatroomBody = document.querySelector('.chatroom-body');

  function sendMainChatMessage() {
    if (!mainChatInput) return;
    const text = mainChatInput.value.trim();
    if (!text) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const messageKey = `mobile-message-${state.nextMessageId++}`;

    const newMsgWrap = document.createElement('div');
    newMsgWrap.className = 'msg-bubble-wrap outgoing';
    newMsgWrap.setAttribute('data-user-created', 'true');
    newMsgWrap.innerHTML = `
      <div class="msg-bubble msg-bubble-green">
        <p class="msg-text">${escapeHtml(text)}</p>
        <button type="button" class="message-task-action" data-create-task><span aria-hidden="true">＋</span> Jadikan tugas</button>
        <button type="button" class="message-save-action" data-save-message>☆ Simpan pesan</button>
        <div class="msg-footer-outgoing">
          <span class="msg-timestamp">${timeStr}</span>
          <span class="read-ticks-green">✓✓</span>
        </div>
      </div>
    `;
    newMsgWrap.querySelector('[data-create-task]').setAttribute('data-task-source', text);
    const saveButton = newMsgWrap.querySelector('[data-save-message]');
    saveButton.setAttribute('data-save-key', messageKey);
    saveButton.setAttribute('data-save-chat', 'Design Team');
    saveButton.setAttribute('data-save-text', text);
    chatroomBody.appendChild(newMsgWrap);
    mainChatInput.value = '';
    chatroomBody.scrollTop = chatroomBody.scrollHeight;
  }

  if (btnSendMainMessage) {
    btnSendMainMessage.addEventListener('click', sendMainChatMessage);
  }
  if (mainChatInput) {
    mainChatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMainChatMessage();
      }
    });
  }

  // --- DEDICATED THREAD HANDLERS ---
  const threadReplyInput = document.getElementById('threadReplyInput');
  const btnSendThreadReply = document.getElementById('btnSendThreadReply');
  const threadBody = document.querySelector('.thread-body');

  function sendThreadReply() {
    if (!threadReplyInput) return;
    const text = threadReplyInput.value.trim();
    if (!text) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newReplyRow = document.createElement('div');
    newReplyRow.className = 'thread-reply-row outgoing';
    newReplyRow.setAttribute('data-user-created', 'true');
    newReplyRow.innerHTML = `
      <div class="reply-bubble">
        <p class="reply-text">${escapeHtml(text)}</p>
        <div class="reply-footer-outgoing">
          <span class="reply-time">${timeStr}</span>
          <span class="read-ticks-green">✓✓</span>
        </div>
      </div>
    `;

    threadBody.appendChild(newReplyRow);
    threadReplyInput.value = '';
    threadBody.scrollTop = threadBody.scrollHeight;
    showToast('Balasan terkirim!');
  }

  if (btnSendThreadReply) {
    btnSendThreadReply.addEventListener('click', sendThreadReply);
  }
  if (threadReplyInput) {
    threadReplyInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendThreadReply();
      }
    });
  }

  function escapeHtml(string) {
    const div = document.createElement('div');
    div.textContent = string;
    return div.innerHTML;
  }

  if (otpKeypad) {
    otpKeypad.addEventListener('click', (e) => {
      const keyBtn = e.target.closest('.keypad-key');
      if (!keyBtn || keyBtn === otpBackspaceBtn) return;

      const digit = keyBtn.getAttribute('data-digit');
      if (digit !== null && state.currentOtpIndex < 6) {
        state.otpCode[state.currentOtpIndex] = digit;
        if (state.currentOtpIndex < 5) {
          state.currentOtpIndex++;
        }
        updateOtpUI();
      }
    });

    if (otpBackspaceBtn) {
      otpBackspaceBtn.addEventListener('click', () => {
        if (state.otpCode[state.currentOtpIndex] !== '') {
          state.otpCode[state.currentOtpIndex] = '';
        } else if (state.currentOtpIndex > 0) {
          state.currentOtpIndex--;
          state.otpCode[state.currentOtpIndex] = '';
        }
        updateOtpUI();
      });
    }
  }

  // Allow clicking directly on OTP boxes to change focus
  otpBoxes.forEach((box, idx) => {
    box.addEventListener('click', () => {
      state.currentOtpIndex = idx;
      updateOtpUI();
    });
  });

  // --- DEMO TOOLBAR CONTROLLER ---
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetScreen = tab.getAttribute('data-target');
      const isModal = tab.getAttribute('data-modal') === 'true';

      if (tab.getAttribute('data-action') === 'profile') {
        openProfileModal();
      } else if (isModal) {
        navigateTo('screen-phone');
        setTimeout(() => openPhoneModal(), 150);
      } else {
        navigateTo(targetScreen);
      }
    });
  });

  // Toggle mobile frame view vs desktop view
  const toggleFrameBtn = document.getElementById('toggleDeviceFrame');
  if (toggleFrameBtn) {
    toggleFrameBtn.addEventListener('click', () => {
      document.body.classList.toggle('force-mobile-frame');
      const isMobileSimulator = document.body.classList.contains('force-mobile-frame');
      showToast(isMobileSimulator ? 'Mode Simulator HP Aktif' : 'Mode Desktop Web Aktif (Foto 3/4)');
    });
  }

  // --- DESKTOP WORKSPACE CONTROLLER (Foto 3 & Foto 4) ---
  const deskOpenThreadBtn = document.getElementById('deskOpenThreadBtn');
  const deskCloseThreadBtn = document.getElementById('deskCloseThreadBtn');
  const deskTasksBtn = document.getElementById('deskTasksBtn');

  if (deskTasksBtn) {
    deskTasksBtn.addEventListener('click', () => {
      navigateTo(state.currentScreen === 'screen-tasks' ? 'screen-chat-room' : 'screen-tasks');
    });
  }

  if (deskOpenThreadBtn) {
    deskOpenThreadBtn.addEventListener('click', () => {
      const panel = document.getElementById('deskThreadPanel');
      if (panel) panel.classList.add('open');
      updateToolbarTabs('screen-thread');
      state.currentScreen = 'screen-thread';
      showToast('Utas thread dibuka (3 kolom)');
    });
  }

  if (deskCloseThreadBtn) {
    deskCloseThreadBtn.addEventListener('click', () => {
      const panel = document.getElementById('deskThreadPanel');
      if (panel) panel.classList.remove('open');
      updateToolbarTabs('screen-chat-room');
      state.currentScreen = 'screen-chat-room';
      showToast('Utas thread ditutup (2 kolom)');
    });
  }

  // Desktop category tabs
  function applyDeskChatFilters() {
    const query = deskSearchInput?.value.trim().toLocaleLowerCase() || '';
    const activeTab = document.querySelector('.desk-tab.active')?.getAttribute('data-tab') || 'all';
    const categoryByChat = {
      'design-team': 'channels',
      'product-announcements': 'channels',
      elena: 'directs',
      'alice-peterson': 'directs',
      tom: 'directs',
      'dev-sprint': 'work',
      marketing: 'work',
      'architecture-guild': 'work'
    };
    document.querySelectorAll('.desk-chat-list .desk-chat-item').forEach(item => {
      const category = item.getAttribute('data-category') || categoryByChat[item.getAttribute('data-chat')] || 'all';
      item.hidden = !item.textContent.toLocaleLowerCase().includes(query)
        || (activeTab !== 'all' && category !== activeTab);
    });
  }

  if (deskSearchInput) {
    deskSearchInput.addEventListener('input', applyDeskChatFilters);
  }
  document.querySelectorAll('.desk-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.desk-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      applyDeskChatFilters();
    });
  });

  // Desktop chat items in sidebar
  const deskChatList = document.querySelector('.desk-chat-list');
  if (deskChatList) {
    deskChatList.addEventListener('click', event => {
      const item = event.target.closest('.desk-chat-item');
      if (!item) return;
      document.querySelectorAll('.desk-chat-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      state.activeChatName = item.querySelector('.desk-name')?.textContent.trim() || 'Design Team';
      updateActiveChatName();
      showToast(`Membuka ${state.activeChatName}`);
    });
  }

  // Desktop Main Chat Send
  const deskMainInput = document.getElementById('deskMainInput');
  const deskSendMainBtn = document.getElementById('deskSendMainBtn');
  const deskChatBody = document.querySelector('.desk-chat-body');

  function sendDeskMainMessage() {
    if (!deskMainInput) return;
    const text = deskMainInput.value.trim();
    if (!text) return;

    const now = new Date();
    const hours = now.getHours() % 12 || 12;
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    const timeStr = `${hours}:${minutes} ${ampm}`;
    const messageKey = `desktop-message-${state.nextMessageId++}`;

    const newRow = document.createElement('div');
    newRow.className = 'desk-msg-row outgoing';
    newRow.setAttribute('data-user-created', 'true');
    newRow.innerHTML = `
      <div class="desk-msg-bubble green">
        <p class="desk-msg-text">${escapeHtml(text)}</p>
        <button type="button" class="message-task-action" data-create-task><span aria-hidden="true">＋</span> Jadikan tugas</button>
        <button type="button" class="message-save-action" data-save-message>☆ Simpan pesan</button>
        <div class="desk-msg-footer">
          <span class="desk-msg-time">${timeStr}</span>
          <span class="desk-check-tick">✓</span>
        </div>
      </div>
    `;
    newRow.querySelector('[data-create-task]').setAttribute('data-task-source', text);
    const saveButton = newRow.querySelector('[data-save-message]');
    saveButton.setAttribute('data-save-key', messageKey);
    saveButton.setAttribute('data-save-chat', 'Design Team');
    saveButton.setAttribute('data-save-text', text);
    if (deskChatBody) {
      deskChatBody.appendChild(newRow);
      deskChatBody.scrollTop = deskChatBody.scrollHeight;
    }
    deskMainInput.value = '';
  }

  if (deskSendMainBtn) deskSendMainBtn.addEventListener('click', sendDeskMainMessage);
  if (deskMainInput) {
    deskMainInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendDeskMainMessage();
      }
    });
  }

  // Desktop Thread Reply Send
  const deskThreadInput = document.getElementById('deskThreadInput');
  const deskSendThreadBtn = document.getElementById('deskSendThreadBtn');
  const deskThreadReplies = document.querySelector('.desk-thread-replies');

  function sendDeskThreadReply() {
    if (!deskThreadInput) return;
    const text = deskThreadInput.value.trim();
    if (!text) return;

    const now = new Date();
    const hours = now.getHours() % 12 || 12;
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    const timeStr = `${hours}:${minutes} ${ampm}`;

    const newReply = document.createElement('div');
    newReply.className = 'thread-item';
    newReply.setAttribute('data-user-created', 'true');
    newReply.innerHTML = `
      <div class="desk-avatar-sm bg-emerald"><span>Me</span></div>
      <div class="thread-item-content">
        <div class="thread-item-header">
          <span class="thread-sender font-bold text-green">Me</span>
          <span class="thread-time">${timeStr}</span>
        </div>
        <p class="thread-msg green-bubble">${escapeHtml(text)}</p>
      </div>
    `;
    if (deskThreadReplies) {
      deskThreadReplies.appendChild(newReply);
      const threadBody = document.querySelector('.desk-thread-body');
      if (threadBody) threadBody.scrollTop = threadBody.scrollHeight;
    }
    deskThreadInput.value = '';
    showToast('Balasan thread terkirim!');
  }

  if (deskSendThreadBtn) deskSendThreadBtn.addEventListener('click', sendDeskThreadReply);
  if (deskThreadInput) {
    deskThreadInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendDeskThreadReply();
      }
    });
  }

  // Reset prototype flow
  const resetDemoBtn = document.getElementById('resetDemoBtn');
  if (resetDemoBtn) {
    resetDemoBtn.addEventListener('click', () => {
      state.phoneNumber = '81572062336';
      state.activeChatName = 'Design Team';
      state.otpCode = ['', '', '', '', '', ''];
      state.currentOtpIndex = 0;
      state.resendCountdown = 60;
      clearInterval(state.resendInterval);
      state.tasks = initialTasks.map(task => ({ ...task }));
      state.nextTaskId = initialTasks.length + 1;
      state.memberCount = 8;
      state.plan = 'Plus';
      state.notificationsEnabled = true;
      state.readReceiptsEnabled = true;
      if (settingsNotificationsToggle) settingsNotificationsToggle.checked = true;
      if (settingsReadReceiptsToggle) settingsReadReceiptsToggle.checked = true;
      state.pendingPlan = null;
      state.savedMessages = [];
      state.nextMessageId = 1;
      document.querySelectorAll('[data-user-created="true"]').forEach(item => item.remove());
      renderTaskLists();
      renderSavedMessages();
      updatePlanUI();
      closeTaskModal();
      closeInviteModal();
      closePlanModal();
      closePaymentModal();
      closeConversationModal();
      closeProfileModal();
      closeSettingsModal();
      closeArchiveModal();
      chatActionMenu.hidden = true;
      threadActionMenu.hidden = true;
      document.querySelectorAll('.message-search-inline').forEach(bar => { bar.hidden = true; });
      document.querySelectorAll('#chatListSearchInput, #deskSearchInput, #mobileMessageSearchInput, #deskMessageSearchInput').forEach(input => {
        input.value = '';
      });
      document.querySelectorAll('.chatlist-body .chat-row, .desk-chat-list .desk-chat-item, .chatroom-body .msg-bubble-wrap, .desk-chat-body .desk-msg-row').forEach(item => {
        item.hidden = false;
      });
      document.querySelectorAll('.desk-tab').forEach(tab => tab.classList.toggle('active', tab.getAttribute('data-tab') === 'all'));
      mobileChatFilters.forEach(filter => {
        const active = filter.getAttribute('data-chat-filter') === 'all';
        filter.classList.toggle('active', active);
        filter.setAttribute('aria-pressed', String(active));
      });
      applyMobileChatFilters();
      applyDeskChatFilters();
      updateActiveChatName();
      const workspace = document.getElementById('desktopWorkspace');
      if (workspace) workspace.classList.remove('sidebar-collapsed');
      if (deskMenuBtn) deskMenuBtn.setAttribute('aria-pressed', 'false');
      if (deskVoiceCallBtn) deskVoiceCallBtn.setAttribute('aria-pressed', 'false');
      document.querySelectorAll('[data-reaction]').forEach(button => button.setAttribute('aria-pressed', 'false'));
      document.querySelectorAll('.reaction-pill[data-reaction]').forEach(button => {
        const initial = button.getAttribute('data-reaction') === '🔥' ? 4 : 2;
        button.textContent = `${button.getAttribute('data-reaction')} ${initial}`;
      });
      updateOtpUI();
      navigateTo('screen-onboarding');
      showToast('Prototipe di-reset ke Halaman Awal');
    });
  }

  // Keyboard navigation shortcuts for testing
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeTaskModal();
      closeInviteModal();
      closePlanModal();
      closePaymentModal();
      closeConversationModal();
      closeProfileModal();
      closeSettingsModal();
      closeArchiveModal();
      chatActionMenu.hidden = true;
      threadActionMenu.hidden = true;
      document.querySelectorAll('[aria-expanded="true"]').forEach(button => button.setAttribute('aria-expanded', 'false'));
    } else if (state.currentScreen === 'screen-phone') {
      if (document.activeElement === phoneInput) {
        if (e.key === 'Enter') openPhoneModal();
        return;
      }
      if (e.key >= '0' && e.key <= '9') {
        if (state.phoneNumber.length < 15) {
          state.phoneNumber += e.key;
          syncStateToUI();
        }
      } else if (e.key === 'Backspace') {
        state.phoneNumber = state.phoneNumber.slice(0, -1);
        syncStateToUI();
      } else if (e.key === 'Enter') {
        openPhoneModal();
      }
    } else if (state.currentScreen === 'screen-verify') {
      if (e.key >= '0' && e.key <= '9') {
        if (state.currentOtpIndex < 6) {
          state.otpCode[state.currentOtpIndex] = e.key;
          if (state.currentOtpIndex < 5) state.currentOtpIndex++;
          updateOtpUI();
        }
      } else if (e.key === 'Backspace') {
        if (state.otpCode[state.currentOtpIndex] !== '') {
          state.otpCode[state.currentOtpIndex] = '';
        } else if (state.currentOtpIndex > 0) {
          state.currentOtpIndex--;
          state.otpCode[state.currentOtpIndex] = '';
        }
        updateOtpUI();
      }
    }
  });

  // Initial UI sync
  syncStateToUI();
  updateOtpUI();
  console.log('CAK.APP Prototype loaded successfully.');
});
