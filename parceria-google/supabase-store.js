/* Parceria Google · salvamento compartilhado (Supabase)
 * Implementa a interface de armazenamento que a Central já usa (db, user, assets, downloads)
 * sobre o Supabase do projeto "central-parques". Status, decisões, evidências, histórico e
 * autor de cada alteração ficam iguais para toda a equipe.
 */
(function () {
  'use strict';
  var SB_URL = 'https://ybtfedngtwsbnwiisrqr.supabase.co';
  var SB_KEY = 'sb_publishable_Gzjs30cpMmThdoedHruqrg_I2I2l6AX';
  var BUCKET = 'parceria-google';
  var NAME_KEY = 'central-usuario';

  var TABLES = {
    acompanhamento: { t: 'pg_acompanhamento', pk: 'chave' },
    historico: { t: 'pg_historico', pk: 'id' },
    evidencias: { t: 'pg_evidencias', pk: 'id' },
    materiais: { t: 'pg_materiais', pk: 'id' },
    recsCustom: { t: 'pg_recs_custom', pk: 'id' }
  };

  var sb = null;
  function client() {
    if (!sb && window.supabase && window.supabase.createClient) {
      sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    }
    return sb;
  }
  function fail(e) { var x = new Error((e && e.message) || 'erro'); x.code = (e && e.code) || 'unknown'; return x; }
  function cfg(col) { var c = TABLES[col]; if (!c) throw fail({ message: 'coleção desconhecida: ' + col, code: 'invalid_argument' }); return c; }
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });
  }

  /* ---------- quem está usando ---------- */
  function slug(s) {
    return (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  }
  function storedName() {
    try { var n = (localStorage.getItem(NAME_KEY) || '').trim(); return n && n.toLowerCase() !== 'visitante' ? n : ''; } catch (e) { return ''; }
  }
  function askName() {
    return new Promise(function (resolve) {
      var wrap = document.createElement('div');
      wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-labelledby', 'pg-id-t');
      wrap.style.cssText = 'position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:16px;background:rgba(1,3,44,.55)';
      wrap.innerHTML =
        '<form style="width:min(420px,100%);background:var(--surface,#fff);color:var(--ink,#01032c);border-radius:12px;padding:24px;box-shadow:0 12px 32px rgba(1,3,44,.3);font-family:var(--font-text,system-ui)">' +
        '<img src="img/478-simbolo.png" width="36" height="36" alt="" style="display:block;margin-bottom:12px">' +
        '<h2 id="pg-id-t" style="margin:0 0 6px;font:600 20px/1.25 var(--font-display,system-ui)">Como você quer aparecer?</h2>' +
        '<p style="margin:0 0 16px;color:var(--muted,#616c90);font-size:14px;line-height:1.45">Seu nome fica registrado como autor de cada alteração na Parceria Google, visível para toda a equipe.</p>' +
        '<label for="pg-id-n" style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Nome e sobrenome</label>' +
        '<input id="pg-id-n" autocomplete="name" maxlength="80" required style="width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid var(--line-2,#7c86a6);border-radius:8px;font:inherit;font-size:15px;background:var(--surface,#fff);color:inherit">' +
        '<button type="submit" style="margin-top:16px;width:100%;padding:11px 16px;border:0;border-radius:8px;background:var(--brand,#0c25a3);color:var(--on-brand,#fff);font:600 15px var(--font-text,system-ui);cursor:pointer">Continuar</button>' +
        '</form>';
      document.body.appendChild(wrap);
      var input = wrap.querySelector('input');
      setTimeout(function () { input.focus(); }, 30);
      wrap.querySelector('form').addEventListener('submit', function (ev) {
        ev.preventDefault();
        var n = input.value.trim().replace(/\s+/g, ' ');
        if (!slug(n)) { input.focus(); return; }
        try { localStorage.setItem(NAME_KEY, n); } catch (e) {}
        wrap.remove(); resolve(n);
      });
    });
  }
  var mePromise = null;
  function me() {
    if (!mePromise) mePromise = (async function () {
      var name = storedName() || await askName();
      var id = slug(name);
      try { await client().from('pg_pessoas').upsert({ id: id, nome: name, visto_em: new Date().toISOString() }); } catch (e) {}
      return { id: id, name: name };
    })();
    return mePromise;
  }
  window.pgTrocarNome = function () { try { localStorage.removeItem(NAME_KEY); } catch (e) {} location.reload(); };

  /* ---------- banco (coleções e documentos) ---------- */
  function snap(rows, pk) {
    return { docs: rows.map(function (r) { return { id: String(r[pk]), data: function () { return Object.assign({}, r.dados); } }; }) };
  }
  async function fetchAll(c) {
    var out = [], from = 0, page = 1000;
    for (;;) {
      var res = await client().from(c.t).select(c.pk + ',dados').order(c.pk).range(from, from + page - 1);
      if (res.error) throw fail(res.error);
      out = out.concat(res.data); if (res.data.length < page) return out; from += page;
    }
  }
  var listeners = [];
  function collection(col) {
    var c = cfg(col);
    return {
      onSnapshot: function (cb, onErr) {
        var timer = null, alive = true;
        var load = function () {
          clearTimeout(timer);
          timer = setTimeout(function () {
            fetchAll(c).then(function (rows) { if (alive) cb(snap(rows, c.pk)); }).catch(function (e) { if (onErr) onErr(fail(e)); });
          }, 120);
        };
        load();
        var ch = client().channel('pg-' + col).on('postgres_changes', { event: '*', schema: 'public', table: c.t }, load)
          .subscribe(function (status) { if (status === 'SUBSCRIBED') load(); });
        listeners.push(load);
        return function () { alive = false; client().removeChannel(ch); };
      },
      add: async function (body) {
        var row = { dados: body }; row[c.pk] = uuid();
        var res = await client().from(c.t).insert(row);
        if (res.error) throw fail(res.error);
        return { id: String(row[c.pk]) };
      }
    };
  }
  function doc(path) {
    var i = path.indexOf('/'), col = path.slice(0, i), id = path.slice(i + 1), c = cfg(col);
    return {
      set: async function (body) {
        var row = { dados: body }; row[c.pk] = id;
        if (col === 'acompanhamento') { row.acao = body.acao; row.parque = body.parque; }
        if (col === 'evidencias') row.chave = body.chave;
        var res = await client().from(c.t).upsert(row);
        if (res.error) throw fail(res.error);
      },
      update: async function (patch) {
        var res = await client().rpc('pg_atualizar', { p_tabela: col, p_id: id, p_patch: patch });
        if (res.error) throw fail(res.error);
      }
    };
  }
  // ao voltar para a aba, sincroniza de novo (cobre conexões de tempo real que caíram)
  document.addEventListener('visibilitychange', function () { if (!document.hidden) listeners.forEach(function (f) { f(); }); });

  /* ---------- arquivos (capturas de tela e anexos) ---------- */
  function publicUrl(path) {
    return SB_URL + '/storage/v1/object/public/' + BUCKET + '/' + String(path).split('/').map(encodeURIComponent).join('/');
  }
  window.pgBlobUrl = function (id) { return /^https?:\/\//.test(id) ? id : publicUrl(id); };
  var assets = {
    upload: async function (file) {
      if (file.size > 20 * 1024 * 1024) throw fail({ message: 'arquivo acima de 20 MB', code: 'quota_exceeded' });
      var ext = ((file.name || '').match(/\.[a-z0-9]{1,6}$/i) || [''])[0].toLowerCase();
      var d = new Date(), path = d.getFullYear() + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + uuid() + ext;
      var res = await client().storage.from(BUCKET).upload(path, file, { contentType: file.type || undefined, upsert: false });
      if (res.error) throw fail(res.error);
      return { id: path, contentType: file.type || '' };
    }
  };

  /* ---------- downloads ---------- */
  var downloads = {
    save: async function (o) {
      var blob = o.data instanceof Blob ? o.data : new Blob([o.data], { type: /\.csv$/i.test(o.filename) ? 'text/csv;charset=utf-8' : 'application/octet-stream' });
      var url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url; a.download = o.filename; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    }
  };

  /* ---------- pessoas ---------- */
  var user = {
    me: me,
    can: async function () { return true; },
    canEdit: async function () { return true; },
    profiles: async function (ids) {
      var res = await client().from('pg_pessoas').select('id,nome').in('id', ids);
      if (res.error) throw fail(res.error);
      var out = {}; res.data.forEach(function (p) { out[p.id] = { name: p.nome }; }); return out;
    }
  };

  var api = { db: { collection: collection, doc: doc }, user: user, assets: assets, downloads: downloads };
  if (!window.claude || !window.claude.use) {
    window.claude = {
      use: function (n) {
        if (!client()) return Promise.reject(fail({ message: 'Supabase indisponível', code: 'unavailable' }));
        return api[n] ? Promise.resolve(api[n]) : Promise.reject(fail({ code: 'not_granted' }));
      }
    };
  }
})();
