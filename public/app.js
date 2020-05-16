var budgetController = (function () {
  var Expenses = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  Expenses.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expenses.prototype.getPercentage = function () {
    return this.percentage;
  };
  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (curr) {
      sum = sum + curr.value;
    });
    data.totals[type] = sum;
  };
  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      inc: 0,
      exp: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, des, val) {
      var newItem, id;
      if (data.allItems[type].length > 0) {
        id = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        id = 0;
      }
      if (type === "exp") {
        newItem = new Expenses(id, des, val);
      } else if (type === "inc") {
        newItem = new Income(id, des, val);
      }
      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem: function (type, id) {
      var ids, index;
      ids = data.allItems[type].map(function (current) {
        return current.id;
      });
      index = ids.indexOf(id);
      if (id !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function () {
      calculateTotal("exp");
      calculateTotal("inc");

      data.budget = data.totals.inc - data.totals.exp;

      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentage: function () {
      data.allItems.exp.forEach(function (curr) {
        curr.calcPercentage(data.totals.inc);
      });
    },
    getPercent: function () {
      var allPercent = data.allItems.exp.map(function (current) {
        return current.getPercentage();
      });

      return allPercent;
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalIncome: data.totals.inc,
        totalExpense: data.totals.exp,
        percentage: data.percentage,
      };
    },

    data: function () {
      return data;
    },
  };
})();

var UIController = (function () {
  var DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    value: ".add__value",
    button: ".add__btn",
    expenseList: ".expenses__list",
    incomeList: ".income__list",
    budgetValue: ".budget__value",
    budgetIncome: ".budget__income--value",
    budgetExpense: ".budget__expenses--value",
    budgetPercent: ".budget__expenses--percentage",
    container: ".container",
    percentage: ".item__percentage",
    title: ".budget__title--month",
  };

  return {
    getType: function (params) {
      return {
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.value).value),
      };
    },

    addItem: function (obj, type) {
      var html, newHtml, element;
      if (type === "inc") {
        element = DOMStrings.incomeList;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMStrings.expenseList;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">%21%%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", obj.value);

      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteItem: function (ID) {
      document
        .getElementById(ID)
        .parentNode.removeChild(document.getElementById(ID));
    },

    clearFields: function () {
      document.querySelector(DOMStrings.inputDescription).value = "";
      document.querySelector(DOMStrings.value).value = "";
      document.querySelector(DOMStrings.inputDescription).focus();
    },

    displayBudget: function (budget) {
      document.querySelector(DOMStrings.budgetValue).textContent =
        budget.budget;
      document.querySelector(DOMStrings.budgetIncome).textContent =
        budget.totalIncome;
      document.querySelector(DOMStrings.budgetExpense).textContent =
        budget.totalExpense;
      document.querySelector(DOMStrings.budgetPercent).textContent =
        budget.percentage + " %";
    },

    displayPercentage: function (percentages) {
      var fields = document.querySelectorAll(DOMStrings.percentage);
      var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      };
      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        }
      });
    },

    displayMonth: function () {
      var date, months, month;
      var months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      date = new Date();
      year = date.getFullYear();
      month = date.getMonth();
      document.querySelector(DOMStrings.title).textContent =
        months[month] + " " + year;
    },

    getDomStrings: function () {
      return DOMStrings;
    },
  };
})();

var controller = (function (budgetCtrl, UICtrl) {
  var setUpEventListener = function () {
    var DOM = UICtrl.getDomStrings();

    document.querySelector(DOM.button).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
  };

  var updateBudget = function () {
    budgetCtrl.calculateBudget();

    var budget = budgetCtrl.getBudget();
    console.log(budget);
    //display the budget on UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentage = function () {
    //calculate Percentage
    budgetCtrl.calculatePercentage();
    //Read percentage from UI controller
    var percentage = budgetCtrl.getPercent();
    //Update UI
    console.log(percentage);
    UICtrl.displayPercentage(percentage);
  };
  //delete item

  var ctrlDeleteItem = function (event) {
    var itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);
    }
    //delete item for data structure
    budgetCtrl.deleteItem(type, ID);
    //delete item from UI
    UICtrl.deleteItem(itemID);
    //update budget
    updateBudget();

    //update Percentage

    updatePercentage();
  };

  var ctrlAddItem = function () {
    var DOM = UICtrl.getDomStrings();
    var input, newItem;

    //Get the input data
    input = UICtrl.getType();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // Add the item to budget controller (data structure)
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // Add the budget to UI
      UICtrl.addItem(newItem, input.type);

      //CLear fields
      UICtrl.clearFields();
    }
    //calculate the budget and display in UI

    updateBudget();

    //update Percentage
    updatePercentage();
  };

  return {
    init: function () {
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalIncome: 0,
        totalExpense: 0,
        percentage: -1,
      });
      setUpEventListener();
    },
  };
})(budgetController, UIController);

controller.init();
