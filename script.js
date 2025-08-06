document.addEventListener('DOMContentLoaded', () => {
    // Pega os elementos do HTML
    const projectContainer = document.getElementById('project-container');
    const searchInput = document.getElementById('searchInput');
    const difficultyFilter = document.getElementById('difficultyFilter');
    const timeFilter = document.getElementById('timeFilter');

    let allProjects = []; // Variável para armazenar todos os projetos carregados

    // Função de "debounce" para otimizar a busca
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Função para buscar os dados do arquivo JSON
    fetch('projects.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na rede: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // Assume que os dados estão na raiz do array no JSON. Se estiverem dentro de uma chave "projetos", use data.projetos
            allProjects = data.filter(p => p['Nome do Projeto']); // Armazena os dados e filtra os vazios
            populateFilters();
            renderProjects(allProjects);
        })
        .catch(error => {
            console.error('Erro ao carregar o arquivo de projetos:', error);
            projectContainer.innerHTML = '<p>Não foi possível carregar os projetos. Verifique o console para mais detalhes.</p>';
        });

    function renderProjects(projects) {
        projectContainer.innerHTML = ''; // Limpa o container
        if (projects.length === 0) {
            projectContainer.innerHTML = '<p>Nenhum projeto encontrado para os filtros selecionados.</p>';
            return;
        }

        projects.forEach(project => {
            // Validação do Link do Projeto
            let projectLink = project['Link do Projeto'] || '#';
            if (projectLink && projectLink !== '#' && !projectLink.startsWith('http')) {
                projectLink = 'https://' + projectLink; // Usa https para mais segurança
            }
            
            // Define um caminho para uma imagem padrão caso o projeto não tenha uma
            const imageUrl = project.imagem || 'img1.png'; 

            const card = document.createElement('div');
            card.className = 'card';
            
            // Monta o HTML do card, agora incluindo a tag <img> no início
            card.innerHTML = `
                <img src="${imageUrl}" alt="Imagem do ${project['Nome do Projeto'] || 'Projeto'}" class="card-image">
                <h2>${project['Nome do Projeto'] || 'Projeto sem nome'}</h2>
                <div class="details">
                    <p>${project['Breve Descrição'] || 'Sem descrição.'}</p>
                    <p><strong>Tecnologias:</strong> ${project['Tecnologias/Materiais'] || 'Não especificado'}</p>
                    <span>Nível: ${project['Nível'] || 'Não especificado'}</span>
                    <span>Tempo: ${project['Tempo de Execução'] || 'Não especificado'}</span>
                </div>
                <a href="${projectLink}" target="_blank" rel="noopener noreferrer">Ver Projeto</a>
            `;
            projectContainer.appendChild(card);
        });
    }

    function populateFilters() {
        const difficulties = [...new Set(allProjects.map(p => p['Nível']).filter(Boolean))];
        const times = [...new Set(allProjects.map(p => p['Tempo de Execução']).filter(Boolean))];

        difficulties.forEach(level => {
            const option = document.createElement('option');
            option.value = level;
            option.textContent = level;
            difficultyFilter.appendChild(option);
        });

        times.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            timeFilter.appendChild(option);
        });
    }

    function filterProjects() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedDifficulty = difficultyFilter.value;
        const selectedTime = timeFilter.value;

        let filteredProjects = allProjects.filter(project => {
            const searchMatch = !searchTerm ||
                (project['Nome do Projeto'] || '').toLowerCase().includes(searchTerm) ||
                (project['Tecnologias/Materiais'] || '').toLowerCase().includes(searchTerm) ||
                (project['Breve Descrição'] || '').toLowerCase().includes(searchTerm);

            const difficultyMatch = selectedDifficulty === 'all' || project['Nível'] === selectedDifficulty;
            const timeMatch = selectedTime === 'all' || project['Tempo de Execução'] === selectedTime;

            return searchMatch && difficultyMatch && timeMatch;
        });

        renderProjects(filteredProjects);
    }

    // Adiciona os "escutadores" de eventos para todos os filtros
    // A busca agora usa o "debounce" para melhorar a performance
    searchInput.addEventListener('input', debounce(filterProjects, 300));
    difficultyFilter.addEventListener('change', filterProjects);
    timeFilter.addEventListener('change', filterProjects);
});