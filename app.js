//Budget Controller
var BudgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calculatePercentage = function (totalIncome) {
        var percentage = '--';
        if (totalIncome > 0) {
            percentage = Math.round((this.value / totalIncome) * 100);
        }
        this.percentage = percentage;

        console.log('asdf ', totalIncome);
        return this.percentage + '%';
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1,
        getBudget: function () {
            return {
                budget: this.budget,
                totalInc: this.total.inc,
                totalExp: this.total.exp,
                percentage: this.percentage
            }
        }
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (current) {
            sum += current.value;
        });

        return data.total[type] = sum;
    }
    var calculateBudget = function () {
        data.budget = calculateTotal('inc') - calculateTotal('exp');
        if (data.total.inc > 0) {
            data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
        }
        return data.getBudget();
    }

    return {
        addItem: function (type, description, value) {
            var id = 0,
                newItem, arr = data.allItems;
            if (arr[type].length > 0) {
                id = arr[type][arr[type].length - 1].id + 1;
            }
            if (type === 'inc') {
                newItem = new Income(id, description, value);
            } else {
                newItem = new Expense(id, description, value);
            }
            arr[type].push(newItem);
            console.log(arr[type]);
            return newItem;
        },
        getData: function () {
            return data;
        },
        getBudget: function () {
            return calculateBudget();
        },
        calculatePercentage: function () {
            var calper = data.allItems.exp.map(function (cur) {
                return cur.calculatePercentage(data.total.inc);
            });
            console.log(calper);
            return calper;
        },
        deleteItem: function (type, id) {
            var IDs, index;
            IDs = data.allItems[type].map(function (current) {
                return current.id;
            });
            index = IDs.indexOf(id);
            console.log('ids', index, ',', IDs);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        }

    };


})();

//User Interface Controller
var UIController = (function () {
    var DOMString = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputVal: '.add__value',
        inputBtn: '.add__btn',
        incContainer: '.income__list',
        expContainer: '.expenses__list',
        budgetLable: '.budget__value',
        incomeLable: '.budget__income--value',
        expensesLable: '.budget__expenses--value',
        percentageLable: '.budget__expenses--percentage',
        container: '.container',
        itemPercentage: '.item__percentage'
    };
    var formatNumber = function (num, type) {
        var int, abs, dec, fixedNo, split;
        abs = Math.abs(num);
        fixedNo = abs.toFixed(2);
        split = fixedNo.split('.');
        int = split[0];
        dec = split[1];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length)
        }
        return (type === 'inc' ? '+' : '-') + int + '.' + dec;
    }
    var nodeForEach = function (nlist, callback) {
        for (var i = 0; i < nlist.length; i++) {
            callback(nlist[i], i);
        }
    }
    var makeList = function (type, obj) {
        var html, element, newHtml;
        if (type === 'inc') {
            element = DOMString.incContainer;
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        } else {
            element = DOMString.expContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }
        newHtml = html.replace('%desc%', (obj.id + 1) + ' ' + obj.description);
        newHtml = newHtml.replace('%id%', obj.id);
        newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

        document.querySelector(element).insertAdjacentHTML('beforeEnd', newHtml);
    }

    var clearInputs = function () {
        var fields;
        fields = document.querySelectorAll(DOMString.inputDescription + ',' + DOMString.inputVal);
        fields = Array.prototype.slice.call(fields);
        fields.forEach(function (current, index, arry) {
            current.value = "";
        });
        console.log(DOMString.inputDescription);
        document.querySelector(DOMString.inputDescription).focus();
    }

    return {
        getInputData: function () {
            return {
                type: document.querySelector(DOMString.inputType).value,
                description: document.querySelector(DOMString.inputDescription).value,
                value: parseFloat(document.querySelector(DOMString.inputVal).value)
            }
        },
        getDOMString: function () {
            return DOMString;
        },
        addList: function (type, obj) {
            makeList(type, obj);
        },
        clearFields: function () {
            clearInputs();
        },
        displayBudget: function (obj) {
            var percentage = '--',
                type;
            if (obj.budget > 0) {
                type = 'inc';
            }
            document.querySelector(DOMString.incomeLable).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMString.expensesLable).textContent = formatNumber(obj.totalExp, 'exp');
            if (obj.totalInc > 0) {
                percentage = obj.percentage;
            }
            document.querySelector(DOMString.percentageLable).textContent = percentage + '%';
            if (obj.budget === 0) {
                document.querySelector(DOMString.budgetLable).textContent = obj.budget + '.00';
            } else {
                document.querySelector(DOMString.budgetLable).textContent = formatNumber(obj.budget, type || 'exp');
            }
        },
        displayPercentage: function (percentages) {
            var elements = document.querySelectorAll(DOMString.itemPercentage);
            nodeForEach(elements, function (item, index) {
                item.textContent = percentages[index];
            });

        },
        changeStyleType: function () {
            var elements = document.querySelectorAll(DOMString.inputType + ',' + DOMString.inputDescription + ',' + DOMString.inputVal);
            nodeForEach(elements, function (cur) {
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMString.inputBtn).classList.toggle('red');
        },
        deleteItem: function (id) {
            document.getElementById(id).parentNode.removeChild(document.getElementById(id));
        }

    }
})();

//Main Controller
var Controller = (function (BudgetCtrl, UICtrl) {

    var superListener = function () {
        var DOM = UICtrl.getDOMString();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (e) {
            if (e.keyCode == 13 || e.which == 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeStyleType);
    }

    var ctrlDeleteItem = function (e) {
        var id, splitID;
        id = e.target.parentElement.parentElement.parentElement.parentElement.id;
        if (id) {
            splitID = id.split('-');
            console.log(parseInt(splitID[1]));
            BudgetCtrl.deleteItem(splitID[0], parseInt(splitID[1]));
            console.log(id);
            UICtrl.deleteItem(id);
            UICtrl.displayBudget(BudgetCtrl.getBudget());
            UICtrl.displayPercentage(BudgetCtrl.calculatePercentage());
            //console.log(splitID);
        }
    }
    var ctrlAddItem = function () {
        var inputData, newItem;
        inputData = UICtrl.getInputData();
        //console.log(inputData.type);
        if (inputData.description.trim() !== '' && !isNaN(inputData.value) && inputData.value > 0) {
            newItem = BudgetCtrl.addItem(inputData.type, inputData.description, inputData.value);
            console.log(BudgetCtrl.getData(), inputData.type);
            UICtrl.addList(inputData.type, newItem);
            UICtrl.clearFields();
            UICtrl.displayBudget(BudgetCtrl.getBudget());
            UICtrl.displayPercentage(BudgetCtrl.calculatePercentage());
        } else {
            alert('Please Enter Data');
        }

    };

    return {
        init: function () {
            superListener();
            var data = BudgetCtrl.getBudget();
            UICtrl.displayBudget(data);
        }
    };
})(BudgetController, UIController);

Controller.init();
