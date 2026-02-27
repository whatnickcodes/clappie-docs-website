(function() {
  var pa = document.querySelector('.parties');
  if (!pa) return;
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) { pa.classList.add('pa-visible'); io.disconnect(); }
    }, { threshold: 0.1 });
    io.observe(pa);
  } else { pa.classList.add('pa-visible'); }

  var S = {
    council: {
      title:'parties — general-counsel — round 2 of 4',
      agents:[
        {n:'📡 Mod',m:'opus',c:'#a78bfa',x:50,y:45},
        {n:'📊 A-1',m:'haiku',c:'#57cfff',x:17,y:15},
        {n:'📊 A-2',m:'haiku',c:'#b4ff69',x:83,y:15},
        {n:'📊 A-3',m:'sonnet',c:'#ff6699',x:17,y:75},
        {n:'📊 A-4',m:'haiku',c:'#ffd700',x:83,y:75}
      ],
      edges:[[0,1],[0,2],[0,3],[0,4]],
      msgs:[[0,1,'"review Q3 budget"'],[1,0,'"R&D too low"'],[2,0,'"agree — 60% R&D"'],[3,0,'"counter: mkt first"'],[0,4,'"cast your vote"'],[4,0,'"R&D +1 ✓"']],
      ledger:[['round','2 / 4'],['topic','Q3 budget'],['votes','{rd:3, mkt:2}'],['status','voting'],['result','pending']]
    },
    redblue: {
      title:'parties — red-vs-blue — round 5 of 10',
      agents:[
        {n:'🔴 Cpt',m:'opus',c:'#ff6347',x:18,y:20},
        {n:'🔴 Fight',m:'haiku',c:'#ff6699',x:18,y:50},
        {n:'🔴 Scout',m:'haiku',c:'#ffa500',x:18,y:80},
        {n:'🔵 Cpt',m:'opus',c:'#57cfff',x:82,y:20},
        {n:'🔵 Fight',m:'haiku',c:'#40e0d0',x:82,y:50},
        {n:'🔵 Scout',m:'haiku',c:'#9370db',x:82,y:80}
      ],
      edges:[[0,1],[0,2],[3,4],[3,5],[0,3]],
      msgs:[[0,1,'"attack sector 4"'],[5,3,'"2 enemies north"'],[2,0,'"flank clear"'],[3,4,'"hold position"'],[1,0,'"sector taken ✓"'],[4,3,'"taking fire!"']],
      ledger:[['round','5 / 10'],['red_hp','847/1000'],['blue_hp','623/1000'],['terrain','forest'],['alert','▓▓▓░░']]
    },
    biz: {
      title:'parties — startup-sim — quarter 3',
      agents:[
        {n:'👔 CEO',m:'opus',c:'#ffd700',x:50,y:8},
        {n:'📈 VP Mktg',m:'sonnet',c:'#ff6699',x:25,y:35},
        {n:'💻 VP Eng',m:'sonnet',c:'#57cfff',x:75,y:35},
        {n:'🎨 Design',m:'haiku',c:'#a78bfa',x:10,y:65},
        {n:'📢 Growth',m:'haiku',c:'#ffa500',x:38,y:65},
        {n:'🔧 Dev-1',m:'haiku',c:'#40e0d0',x:62,y:65},
        {n:'🔧 Dev-2',m:'haiku',c:'#b4ff69',x:88,y:65},
        {n:'💰 CFO',m:'sonnet',c:'#ff6347',x:50,y:92}
      ],
      edges:[[0,1],[0,2],[0,7],[1,3],[1,4],[2,5],[2,6]],
      msgs:[[0,2,'"ship by Friday"'],[5,2,'"PR merged ✓"'],[0,1,'"launch Monday"'],[4,1,'"need $5k ads"'],[7,0,'"runway: 8 months"'],[3,1,'"mockups done ✓"']],
      ledger:[['quarter','Q3 2026'],['revenue','$1.2M/$2M'],['runway','8 months'],['team','12'],['morale','████░']]
    },
    survivor: {
      title:'parties — dungeon-crawl — floor 3',
      agents:[
        {n:'🐉 DM',m:'opus',c:'#a78bfa',x:50,y:12},
        {n:'⚔️ Knight',m:'haiku',c:'#ff6347',x:15,y:42},
        {n:'🧙 Mage',m:'haiku',c:'#57cfff',x:85,y:42},
        {n:'🏹 Ranger',m:'haiku',c:'#b4ff69',x:25,y:80},
        {n:'🗡️ Rogue',m:'haiku',c:'#ffd700',x:75,y:80}
      ],
      edges:[[0,1],[0,2],[0,3],[0,4],[1,2],[3,4]],
      msgs:[[0,1,'"3 goblins ahead"'],[1,0,'"I charge — rolled 18"'],[2,0,'"fireball! 6d6"'],[3,4,'"flank left?"'],[4,0,'"sneak attack ✓"'],[0,2,'"goblin saves — miss"']],
      ledger:[['floor','3 / 5'],['party hp','73%'],['gold','482'],['encounter','goblin den'],['boss','???']]
    },
    chain: {
      title:'chain topology — sequential relay',
      agents:[
        {n:'🔗 A',m:'haiku',c:'#57cfff',x:10,y:50},
        {n:'🔗 B',m:'haiku',c:'#40e0d0',x:30,y:50},
        {n:'🔗 C',m:'haiku',c:'#b4ff69',x:50,y:50},
        {n:'🔗 D',m:'haiku',c:'#ffd700',x:70,y:50},
        {n:'🔗 E',m:'haiku',c:'#ff6699',x:90,y:50}
      ],
      edges:[[0,1],[1,2],[2,3],[3,4]],
      msgs:[[0,1,'"pass it on"'],[1,2,'"relaying…"'],[2,3,'"+context"'],[3,4,'"final hop"']],
      ledger:[['topology','chain'],['hops','4'],['latency','sequential'],['agents','5'],['flow','A → E']]
    },
    star: {
      title:'star topology — hub & spoke',
      agents:[
        {n:'⭐ Hub',m:'opus',c:'#ffd700',x:50,y:45},
        {n:'📡 N1',m:'haiku',c:'#57cfff',x:50,y:8},
        {n:'📡 N2',m:'haiku',c:'#ff6699',x:85,y:30},
        {n:'📡 N3',m:'haiku',c:'#b4ff69',x:85,y:70},
        {n:'📡 N4',m:'haiku',c:'#40e0d0',x:50,y:88},
        {n:'📡 N5',m:'haiku',c:'#a78bfa',x:15,y:70},
        {n:'📡 N6',m:'haiku',c:'#ffa500',x:15,y:30}
      ],
      edges:[[0,1],[0,2],[0,3],[0,4],[0,5],[0,6]],
      msgs:[[1,0,'"report in"'],[0,3,'"task for you"'],[5,0,'"done ✓"'],[0,2,'"broadcast"']],
      ledger:[['topology','star'],['hub','opus'],['spokes','6'],['latency','1 hop'],['control','centralized']]
    },
    tree: {
      title:'tree topology — hierarchy',
      agents:[
        {n:'👑 Root',m:'opus',c:'#ffd700',x:50,y:8},
        {n:'🔹 L1a',m:'sonnet',c:'#a78bfa',x:25,y:35},
        {n:'🔹 L1b',m:'sonnet',c:'#57cfff',x:75,y:35},
        {n:'🔸 L2a',m:'haiku',c:'#b4ff69',x:12,y:70},
        {n:'🔸 L2b',m:'haiku',c:'#ff6699',x:38,y:70},
        {n:'🔸 L2c',m:'haiku',c:'#40e0d0',x:62,y:70},
        {n:'🔸 L2d',m:'haiku',c:'#ffa500',x:88,y:70}
      ],
      edges:[[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]],
      msgs:[[0,1,'"delegate left"'],[0,2,'"delegate right"'],[1,3,'"subtask"'],[4,1,'"done ✓"'],[2,5,'"subtask"']],
      ledger:[['topology','tree'],['depth','3'],['branches','2'],['agents','7'],['flow','top → down']]
    },
    mesh: {
      title:'full mesh — everyone talks',
      agents:[
        {n:'🕸️ A',m:'haiku',c:'#57cfff',x:50,y:10},
        {n:'🕸️ B',m:'haiku',c:'#ff6699',x:88,y:35},
        {n:'🕸️ C',m:'haiku',c:'#b4ff69',x:75,y:82},
        {n:'🕸️ D',m:'haiku',c:'#ffd700',x:25,y:82},
        {n:'🕸️ E',m:'haiku',c:'#a78bfa',x:12,y:35}
      ],
      edges:[[0,1],[0,2],[0,3],[0,4],[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]],
      msgs:[[0,2,'"consensus?"'],[3,1,'"agree ✓"'],[4,0,'"dissent"'],[1,3,'"reconsider"']],
      ledger:[['topology','full mesh'],['edges','10'],['latency','1 hop any'],['agents','5'],['consensus','80%']]
    },
    smallworld: {
      title:'small-world — clusters + bridges',
      agents:[
        {n:'🌐 H1',m:'sonnet',c:'#ffd700',x:25,y:30},
        {n:'🔵 C1a',m:'haiku',c:'#57cfff',x:10,y:12},
        {n:'🔵 C1b',m:'haiku',c:'#40e0d0',x:10,y:55},
        {n:'🔵 C1c',m:'haiku',c:'#9370db',x:40,y:12},
        {n:'🌐 H2',m:'sonnet',c:'#ff6347',x:75,y:70},
        {n:'🔴 C2a',m:'haiku',c:'#ff6699',x:60,y:88},
        {n:'🔴 C2b',m:'haiku',c:'#ffa500',x:90,y:88},
        {n:'🔴 C2c',m:'haiku',c:'#b4ff69',x:90,y:50}
      ],
      edges:[[0,1],[0,2],[0,3],[1,2],[2,3],[4,5],[4,6],[4,7],[5,6],[6,7],[0,4]],
      msgs:[[1,0,'"local update"'],[0,4,'"bridge msg"'],[4,6,'"relay"'],[5,4,'"cluster news"']],
      ledger:[['topology','small-world'],['clusters','2'],['bridges','1'],['agents','8'],['diameter','3 hops']]
    }
  };

  var cur='council';

  function render() {
    var s=S[cur],n=s.agents.length;
    document.getElementById('pa-svg').innerHTML=s.edges.map(function(e){
      var a=s.agents[e[0]],b=s.agents[e[1]];
      return '<line x1="'+a.x+'%" y1="'+a.y+'%" x2="'+b.x+'%" y2="'+b.y+'%"/>';
    }).join('');

    document.getElementById('pa-terms').innerHTML=s.agents.map(function(ag){
      return '<div class="pa-term" style="left:'+ag.x+'%;top:'+ag.y+'%"><div class="pa-term-bar" style="border-color:'+ag.c+'"><div class="pa-term-dots"><span class="pa-tdot" style="background:#ff5f56"></span><span class="pa-tdot" style="background:#ffbd2e"></span><span class="pa-tdot" style="background:#27c93f"></span></div><div class="pa-term-content"><span class="pa-term-name">'+ag.n+'</span><small>'+ag.m+'</small></div></div></div>';
    }).join('');

    document.getElementById('pa-msgs').innerHTML=s.msgs.map(function(msg,i){
      var from=s.agents[msg[0]],to=s.agents[msg[1]];
      return '<div class="pa-msg" style="--sx:'+from.x+'%;--sy:'+from.y+'%;--dx:'+to.x+'%;--dy:'+to.y+'%;--md:'+(i*1.5)+'s;border-left-color:'+from.c+'">'+msg[2]+'</div>';
    }).join('');

    document.getElementById('pa-lrows').innerHTML=s.ledger.map(function(r){
      return '<div class="pa-ledger-row"><span class="pa-ledger-k">'+r[0]+'</span><span class="pa-ledger-v">'+r[1]+'</span></div>';
    }).join('');
  }

  document.querySelectorAll('.pa-tab').forEach(function(btn){
    btn.addEventListener('click',function(){
      document.querySelectorAll('.pa-tab').forEach(function(b){b.classList.remove('active');});
      btn.classList.add('active');cur=btn.dataset.s;render();
    });
  });

  render();
})();
