import React, { useMemo, useState } from 'react';
import { Building2, Check, ChevronDown, Clock3, Mail, MapPin, Pencil, Phone, Plus, Search, Star, UserRound, X } from 'lucide-react';
import './branches-workspace.css';

export const initialBranches = [
  { id: 1, name: 'Центральный филиал', city: 'Берлин', address: 'Friedrichstraße 120, 10117', manager: 'Анна Петрова', phone: '+49 30 5550 1200', email: 'mitte@forkli.example', rooms: 6, hours: 'Пн–Сб · 09:00–20:00', status: 'Работает', isMain: true },
  { id: 2, name: 'Западный филиал', city: 'Берлин', address: 'Kantstraße 52, 10625', manager: 'Елена Смирнова', phone: '+49 30 5550 1202', email: 'west@forkli.example', rooms: 4, hours: 'Пн–Пт · 10:00–20:00', status: 'Работает', isMain: false },
];

const blankBranch = { name: '', city: '', address: '', manager: '', phone: '', email: '', rooms: 2, hours: 'Пн–Пт · 09:00–20:00', status: 'Работает', isMain: false };

function BranchDialog({ initial, onClose, onSave }) {
  const [form, setForm] = useState({ ...blankBranch, ...initial });
  const change = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const submit = event => {
    event.preventDefault();
    onSave({ ...form, rooms: Math.max(0, Number(form.rooms) || 0) });
  };

  return <div className="modal-overlay branch-overlay" onMouseDown={event => event.target === event.currentTarget && onClose()}>
    <form className="modal branch-dialog" onSubmit={submit}>
      <div className="modal-head"><div><h2>{initial ? 'Редактировать филиал' : 'Добавить филиал'}</h2><p>Контакты, ответственный и параметры площадки</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Закрыть"><X size={18}/></button></div>
      <div className="form-grid">
        <label className="form-field full"><span>Название филиала <i>*</i></span><input required maxLength="70" autoFocus placeholder="Например, Центральный филиал" value={form.name} onChange={event => change('name', event.target.value)}/></label>
        <label className="form-field"><span>Город <i>*</i></span><input required maxLength="50" placeholder="Берлин" value={form.city} onChange={event => change('city', event.target.value)}/></label>
        <label className="form-field"><span>Кабинеты</span><input type="number" min="0" max="200" value={form.rooms} onChange={event => change('rooms', event.target.value)}/></label>
        <label className="form-field full"><span>Адрес <i>*</i></span><input required maxLength="120" placeholder="Улица, номер, индекс" value={form.address} onChange={event => change('address', event.target.value)}/></label>
        <label className="form-field"><span>Ответственный</span><input maxLength="70" placeholder="Имя и фамилия" value={form.manager} onChange={event => change('manager', event.target.value)}/></label>
        <label className="form-field"><span>Телефон филиала</span><input type="tel" maxLength="30" placeholder="+49 30 0000 0000" value={form.phone} onChange={event => change('phone', event.target.value)}/></label>
        <label className="form-field"><span>Рабочая почта</span><input type="email" maxLength="120" placeholder="branch@example.eu" value={form.email} onChange={event => change('email', event.target.value)}/></label>
        <label className="form-field"><span>Часы работы</span><input maxLength="60" placeholder="Пн–Пт · 09:00–20:00" value={form.hours} onChange={event => change('hours', event.target.value)}/></label>
        <label className="form-field"><span>Статус филиала</span><select value={form.status} onChange={event => change('status', event.target.value)}><option>Работает</option><option>Приостановлен</option></select></label>
        <label className="branch-main-toggle"><input type="checkbox" checked={form.isMain} onChange={event => change('isMain', event.target.checked)}/><span><b>Основной филиал</b><small>Будет отмечен как центральная площадка</small></span></label>
      </div>
      <div className="modal-foot"><span><i>*</i> Обязательные поля</span><button type="button" className="secondary-button" onClick={onClose}>Отмена</button><button className="primary-button" type="submit"><Check size={16}/>{initial ? 'Сохранить изменения' : 'Добавить филиал'}</button></div>
    </form>
  </div>;
}

export default function BranchesWorkspace({ branches, setBranches, search, flash }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Все филиалы');
  const [editing, setEditing] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const activeCount = branches.filter(branch => branch.status === 'Работает').length;
  const cityCount = new Set(branches.map(branch => branch.city.trim()).filter(Boolean)).size;
  const roomCount = branches.reduce((total, branch) => total + (Number(branch.rooms) || 0), 0);
  const visibleBranches = useMemo(() => branches.filter(branch => {
    const term = `${query} ${search}`.trim().toLocaleLowerCase('ru');
    const matches = !term || `${branch.name} ${branch.city} ${branch.address} ${branch.manager}`.toLocaleLowerCase('ru').includes(term);
    return matches && (statusFilter === 'Все филиалы' || branch.status === statusFilter);
  }), [branches, query, search, statusFilter]);

  const saveBranch = value => {
    if (editing) {
      setBranches(current => {
        const next = current.map(branch => branch.id === editing.id ? { ...branch, ...value } : { ...branch, isMain: value.isMain ? false : branch.isMain });
        if (next.length && !next.some(branch => branch.isMain)) next[0] = { ...next[0], isMain: true };
        return next;
      });
      flash('Данные филиала обновлены в демо-сессии');
    } else {
      const next = { ...value, id: Date.now() };
      setBranches(current => [...current.map(branch => ({ ...branch, isMain: value.isMain ? false : branch.isMain })), next]);
      flash('Филиал добавлен в демо-сессию');
    }
    setDialogOpen(false);
    setEditing(null);
  };

  const toggleStatus = branch => {
    const status = branch.status === 'Работает' ? 'Приостановлен' : 'Работает';
    setBranches(current => current.map(item => item.id === branch.id ? { ...item, status } : item));
    flash(status === 'Работает' ? 'Филиал снова активен' : 'Филиал приостановлен');
  };

  const setMain = branch => {
    setBranches(current => current.map(item => ({ ...item, isMain: item.id === branch.id })));
    flash(`${branch.name} назначен основным филиалом`);
  };

  return <div className="branches-workspace">
    <div className="page-head workspace-head"><div><span className="branches-kicker">РАБОЧЕЕ ПРОСТРАНСТВО · ЛОКАЦИИ</span><h1>Филиалы</h1><p>Управляйте площадками, контактами и статусом филиалов школы.</p></div><button className="primary-button" onClick={() => { setEditing(null); setDialogOpen(true); }}><Plus size={17}/> Добавить филиал</button></div>

    <div className="workspace-stats branches-stats">
      <div className="workspace-stat"><span className="workspace-stat-icon blue"><Building2 size={18}/></span><span><small>Всего филиалов</small><b>{branches.length}</b><em>в демо-системе</em></span></div>
      <div className="workspace-stat"><span className="workspace-stat-icon green"><Check size={18}/></span><span><small>Работают</small><b>{activeCount}</b><em>активные площадки</em></span></div>
      <div className="workspace-stat"><span className="workspace-stat-icon violet"><MapPin size={18}/></span><span><small>Города</small><b>{cityCount}</b><em>география школы</em></span></div>
      <div className="workspace-stat"><span className="workspace-stat-icon amber"><Building2 size={18}/></span><span><small>Кабинеты</small><b>{roomCount}</b><em>по всем филиалам</em></span></div>
    </div>

    <section className="workspace-panel branches-panel"><div className="workspace-panel-head"><div><h2>Список филиалов</h2><p>Контактные данные и операционный статус каждой площадки</p></div><span className="branches-counter">{visibleBranches.length} из {branches.length}</span></div>
      <div className="branches-toolbar"><label className="branches-search"><Search size={16}/><input aria-label="Поиск филиалов" placeholder="Поиск по названию, городу или адресу" value={query} onChange={event => setQuery(event.target.value)}/></label><label className="branches-status-filter"><span>Статус</span><select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option>Все филиалы</option><option>Работает</option><option>Приостановлен</option></select><ChevronDown size={14}/></label></div>
      <div className="branch-grid">{visibleBranches.map(branch => <article className="branch-card" key={branch.id}>
        <div className="branch-card-top"><span className="branch-icon"><Building2 size={19}/></span><div className="branch-badges">{branch.isMain && <span className="branch-main-badge"><Star size={12} fill="currentColor"/> Основной</span>}<span className={`branch-status ${branch.status === 'Работает' ? 'is-active' : 'is-paused'}`}><i/>{branch.status}</span></div><button className="branch-edit" onClick={() => { setEditing(branch); setDialogOpen(true); }} aria-label={`Редактировать ${branch.name}`}><Pencil size={15}/></button></div>
        <div className="branch-title"><h3>{branch.name}</h3><span><MapPin size={14}/>{branch.city}</span></div>
        <p className="branch-address">{branch.address || 'Адрес не указан'}</p>
        <div className="branch-meta"><span><UserRound size={14}/> Ответственный</span><b>{branch.manager || 'Не назначен'}</b></div>
        <div className="branch-contact"><span><Phone size={14}/>{branch.phone || 'Телефон не указан'}</span><span><Mail size={14}/>{branch.email || 'Почта не указана'}</span></div>
        <div className="branch-card-foot"><span><Building2 size={14}/>{branch.rooms} {branch.rooms === 1 ? 'кабинет' : branch.rooms > 1 && branch.rooms < 5 ? 'кабинета' : 'кабинетов'}</span><span><Clock3 size={14}/>{branch.hours || 'График не указан'}</span></div>
        <div className="branch-card-actions">{!branch.isMain && <button onClick={() => setMain(branch)}>Назначить основным</button>}<button onClick={() => toggleStatus(branch)}>{branch.status === 'Работает' ? 'Приостановить' : 'Возобновить'}</button></div>
      </article>)}</div>
      {!visibleBranches.length && <div className="branches-empty"><Search size={22}/><b>Филиалы не найдены</b><span>Измените запрос или статус фильтра.</span><button className="secondary-button" onClick={() => { setQuery(''); setStatusFilter('Все филиалы'); }}>Сбросить фильтры</button></div>}
    </section>
    <div className="branches-demo-note"><Building2 size={15}/><span>Это демонстрационные филиалы. Добавления и изменения действуют в текущей демо-сессии и не отправляются на сервер.</span></div>
    {(dialogOpen || editing) && <BranchDialog key={editing?.id || 'new-branch'} initial={editing} onClose={() => { setDialogOpen(false); setEditing(null); }} onSave={saveBranch}/>}
  </div>;
}
