
// 放在文件最上方
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}
//取得花色
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const view = {
  
 //負責生成卡片內容，包括花色和數字
 //根據index來決定是哪一個花色
 getCardElement (index) {
  return `<div data-index="${index}" class="card back"></div>`
},
getCardContent (index) {
  const number = this.transformNumber((index % 13) + 1)
  const symbol = Symbols[Math.floor(index / 13)]
  return `
    <p>${number}</p>
    <img src="${symbol}" />
    <p>${number}</p>
  `
},
//轉換特殊數字
transformNumber (number) {
  switch (number) {
    case 1:
      return 'A'
    case 11:
      return 'J'
    case 12:
      return 'Q'
    case 13:
      return 'K'
    default:
      return number
  }
},
 //透過displayCards 來生成卡片
  displayCards (indexes) {
    const rootElement = document.querySelector('#cards')
    //rootElement.innerHTML = this.getCardElement()
    //rootElement.innerHTML = utility.getRandomNumberArray(52).map(index => this.getCardElement(index)).join('')
    rootElement.innerHTML =indexes.map(index => this.getCardElement(index)).join('')
  },

  //翻牌模式
  flipCards (...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        //回傳正面
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      //回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  pairCards (...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },
  renderScore(score) {
    document.querySelector(".score").innerHTML = `Score: ${score}`;
  },
  
  renderTriedTimes(times) {
    document.querySelector(".tried").innerHTML = `You've tried: ${times} times`;
  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event =>   event.target.classList.remove('wrong'), { once: true })
      })
    },
//遊戲結束
    showGameFinished () {
      const div = document.createElement('div')
      div.classList.add('completed')
      div.innerHTML = `
        <p>Complete!</p>
        <p>Score: ${model.score}</p>
        <p>You've tried: ${model.triedTimes} times</p>
      `
      const header = document.querySelector('#header')
      header.before(div)
    }
}
//集中管理資料的地方
const model = {
  
  //被翻開的卡片
  revealedCards: [],
  isRevealedCardsMatched () {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  score: 0,
  triedTimes: 0
}

//衣遊戲狀態來分配動作定義current state 來記錄遊戲目前得狀態
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,  // 加在第一行
  generateCards () {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  dispatchCardAction (card) {
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          // 配對成功
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          //view.pairCards(model.revealedCards[0])
          //view.pairCards(model.revealedCards[1])
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          //game finish
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }

          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
        //   setTimeout(() => {
        //     //view.flipCard(model.revealedCards[0])
        //     //view.flipCard(model.revealedCards[1])
        //     view.flipCards(...model.revealedCards)
        //     model.revealedCards = []
        //     this.currentState = GAME_STATE.FirstCardAwaits
        //   }, 1000)
        // }
        view.appendWrongAnimation(...model.revealedCards)
        setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log('this.currentState', this.currentState)
    console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
  },

  resetCards () {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}


const utility = {
  getRandomNumberArray (count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

controller.generateCards() // 取代 view.displayCards()
//view.displayCards()
//每張卡片加入事件監聽器
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})