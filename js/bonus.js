class Match3Game {
    constructor() {
        this.board = document.getElementById('game-board');
        this.scoreElement = document.getElementById('score-value');
        this.cleanWater = document.getElementById('clean-water');
        this.water = document.getElementById('water');
        this.victoryScreen = document.getElementById('victory-screen');
        this.boardSize = 8;
        this.types = 5;
        this.score = 0;
        this.selectedTile = null;
        this.grid = [];
        this.images = [
            'img/free-icon-diesel-2051302.png',
            'img/free-icon-oil-barrel-3444163.png',
            'img/free-icon-oil-barrel-4515613.png',
            'img/free-icon-oil-2051338.png',
            'img/free-icon-petroleum-4055245.png'
        ];
        this.gameWon = false;
        this.initializeBoard();
    }

    initializeBoard() {
        // Создаем начальную сетку
        for (let i = 0; i < this.boardSize; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.boardSize; j++) {
                let type;
                do {
                    type = Math.floor(Math.random() * this.types) + 1;
                } while (this.wouldCauseMatch(i, j, type));
                
                this.grid[i][j] = type;
                
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.dataset.type = type;
                tile.dataset.row = i;
                tile.dataset.col = j;
                const img = document.createElement('img');
                img.src = this.images[type - 1];
                img.style.width = '80%';
                img.style.height = '80%';
                tile.appendChild(img); 
                
                tile.addEventListener('click', () => this.handleTileClick(tile));
                this.board.appendChild(tile);
            }
        }
    }

    

    wouldCauseMatch(row, col, type) {
        // Проверка по горизонтали
        if (col >= 2) {
            if (this.grid[row][col-1] === type && this.grid[row][col-2] === type) {
                return true;
            }
        }
        // Проверка по вертикали
        if (row >= 2) {
            if (this.grid[row-1][col] === type && this.grid[row-2][col] === type) {
                return true;
            }
        }
        return false;
    }

    handleTileClick(tile) {
        if (!this.selectedTile) {
            this.selectedTile = tile;
            tile.classList.add('selected');
        } else {
            const row1 = parseInt(this.selectedTile.dataset.row);
            const col1 = parseInt(this.selectedTile.dataset.col);
            const row2 = parseInt(tile.dataset.row);
            const col2 = parseInt(tile.dataset.col);

            if (this.isAdjacent(row1, col1, row2, col2)) {
                this.swapTiles(this.selectedTile, tile);
                this.selectedTile.classList.remove('selected');
                this.selectedTile = null;
            } else {
                this.selectedTile.classList.remove('selected');
                this.selectedTile = tile;
                tile.classList.add('selected');
            }
        }
    }

    isAdjacent(row1, col1, row2, col2) {
        return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
    }

    async swapTiles(tile1, tile2) {
        // Меняем местами в сетке
        const row1 = parseInt(tile1.dataset.row);
        const col1 = parseInt(tile1.dataset.col);
        const row2 = parseInt(tile2.dataset.row);
        const col2 = parseInt(tile2.dataset.col);
        
        // Сохраняем оригинальные значения
        const type1 = this.grid[row1][col1];
        const type2 = this.grid[row2][col2];
        const img1 = tile1.querySelector('img').src;
        const img2 = tile2.querySelector('img').src;
        const dataType1 = tile1.dataset.type;
        const dataType2 = tile2.dataset.type;

        // Меняем местами в сетке
        this.grid[row1][col1] = type2;
        this.grid[row2][col2] = type1;

        // Меняем местами в DOM
        tile1.dataset.type = dataType2;
        tile1.querySelector('img').src = img2;
        tile2.dataset.type = dataType1;
        tile2.querySelector('img').src = img1;

        // Проверяем, есть ли совпадения после свапа
        if (!this.checkForMatches()) {
            // Если совпадений нет, показываем анимацию и меняем обратно
            tile1.classList.add('invalid-move');
            tile2.classList.add('invalid-move');
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Возвращаем оригинальные значения
            this.grid[row1][col1] = type1;
            this.grid[row2][col2] = type2;
            
            tile1.dataset.type = dataType1;
            tile1.querySelector('img').src = img1;
            tile2.dataset.type = dataType2;
            tile2.querySelector('img').src = img2;
            
            // Убираем класс анимации
            tile1.classList.remove('invalid-move');
            tile2.classList.remove('invalid-move');
        } else {
            await this.handleMatches();
        }
    }

    checkForMatches() {
        const matches = new Set();
        
        // Проверка горизонтальных совпадений
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize - 2; j++) {
                if (this.grid[i][j] === this.grid[i][j+1] && 
                    this.grid[i][j] === this.grid[i][j+2]) {
                    matches.add(`${i},${j}`);
                    matches.add(`${i},${j+1}`);
                    matches.add(`${i},${j+2}`);
                }
            }
        }

        // Проверка вертикальных совпадений
        for (let i = 0; i < this.boardSize - 2; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.grid[i][j] === this.grid[i+1][j] && 
                    this.grid[i][j] === this.grid[i+2][j]) {
                    matches.add(`${i},${j}`);
                    matches.add(`${i+1},${j}`);
                    matches.add(`${i+2},${j}`);
                }
            }
        }

        return matches.size > 0;
    }

    async handleMatches() {
        let hasMatches;
        do {
            hasMatches = false;
            const matches = new Set();
            
            // Находим все совпадения
            for (let i = 0; i < this.boardSize; i++) {
                for (let j = 0; j < this.boardSize - 2; j++) {
                    if (this.grid[i][j] === this.grid[i][j+1] && 
                        this.grid[i][j] === this.grid[i][j+2]) {
                        matches.add(`${i},${j}`);
                        matches.add(`${i},${j+1}`);
                        matches.add(`${i},${j+2}`);
                        hasMatches = true;
                    }
                }
            }

            for (let i = 0; i < this.boardSize - 2; i++) {
                for (let j = 0; j < this.boardSize; j++) {
                    if (this.grid[i][j] === this.grid[i+1][j] && 
                        this.grid[i][j] === this.grid[i+2][j]) {
                        matches.add(`${i},${j}`);
                        matches.add(`${i+1},${j}`);
                        matches.add(`${i+2},${j}`);
                        hasMatches = true;
                    }
                }
            }

            if (hasMatches) {
                // Обновляем счет
                this.score += matches.size;
                this.scoreElement.textContent = this.score;
                
                // Очищаем воду
                this.updateWater();

                // Удаляем совпавшие тайлы
                for (const match of matches) {
                    const [row, col] = match.split(',').map(Number);
                    const tile = this.board.children[row * this.boardSize + col];
                    tile.classList.add('pop');
                }

                // Ждем завершения анимации
                await new Promise(resolve => setTimeout(resolve, 300));

                // Убираем класс анимации
                for (const match of matches) {
                    const [row, col] = match.split(',').map(Number);
                    const tile = this.board.children[row * this.boardSize + col];
                    tile.classList.remove('pop');
                }

                // Обновляем сетку
                this.dropTiles(matches);
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        } while (hasMatches);
    }

    dropTiles(matches) {
        for (let col = 0; col < this.boardSize; col++) {
            let emptySpaces = 0;
            
            for (let row = this.boardSize - 1; row >= 0; row--) {
                if (matches.has(`${row},${col}`)) {
                    emptySpaces++;
                } else if (emptySpaces > 0) {
                    this.grid[row + emptySpaces][col] = this.grid[row][col];
                    const tile = this.board.children[row * this.boardSize + col];
                    const newTile = this.board.children[(row + emptySpaces) * this.boardSize + col];
                    
                    newTile.dataset.type = tile.dataset.type;
                    newTile.innerHTML = tile.innerHTML;
                    newTile.dataset.row = row + emptySpaces;
                }
            }

            for (let row = emptySpaces - 1; row >= 0; row--) {
                const type = Math.floor(Math.random() * this.types) + 1;
                this.grid[row][col] = type;
                const tile = this.board.children[row * this.boardSize + col];
                tile.dataset.type = type;
                const img = document.createElement('img');
                img.src = this.images[type - 1];
                img.style.width = '80%';
                img.style.height = '80%';
                tile.innerHTML = ''; // Очищаємо старий вміст
                tile.appendChild(img);
            }
        }
    }

    updateWater() {
        const maxScore = 100;
        const cleanPercentage = Math.min((this.score / maxScore) * 100, 100);
        
        // Вместо изменения высоты, меняем прозрачность воды
        this.cleanWater.style.opacity = cleanPercentage / 100;
        this.water.style.opacity = 1 - (cleanPercentage / 100);
        
        // Добавляем эффект очистки через цвет
        const dirtyColor = [255, 107, 107]; // #ff6b6b
        const cleanColor = [74, 171, 247];  // #4dabf7
        
        const r = Math.floor(dirtyColor[0] + (cleanColor[0] - dirtyColor[0]) * (cleanPercentage / 100));
        const g = Math.floor(dirtyColor[1] + (cleanColor[1] - dirtyColor[1]) * (cleanPercentage / 100));
        const b = Math.floor(dirtyColor[2] + (cleanColor[2] - dirtyColor[2]) * (cleanPercentage / 100));
        
        this.water.style.background = `linear-gradient(to bottom, rgb(${r},${g},${b}), rgb(${r-20},${g-20},${b-20}))`;

        // Показываем экран победы при достижении 100%
        if (cleanPercentage >= 100 && !this.gameWon) {
            this.gameWon = true;
            this.victoryScreen.style.display = 'flex';
            
            // Добавляем конфетти
            const duration = 5 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1001 };

            function randomInRange(min, max) {
                return Math.random() * (max - min) + min;
            }

            const interval = setInterval(function() {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                
                // Конфетти с обеих сторон
                confetti(Object.assign({}, defaults, {
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
                }));
                confetti(Object.assign({}, defaults, {
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
                }));
            }, 250);
        }
    }
}

// Запускаем игру
window.addEventListener('load', () => {
    new Match3Game();
}); 