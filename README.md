# Stock and Product History Services

## Описание

Этот проект состоит из двух сервисов:

1. **Stock Service** — управление товарами, их остатками и данными магазинов.
2. **Product History Service** — отслеживание и хранение истории действий с товарами и остатками.

Оба сервиса используют PostgreSQL и взаимодействуют через HTTP-запросы.

---

## Установка и запуск

1. Склонируйте репозиторий:
   ```bash
   git clone <URL-репозитория>
   cd <папка-репозитория>
   ```

2. Установите зависимости для каждого сервиса:
   ```bash
   cd stock-service
   npm install
   cd ../history-service
   npm install
   ```

3. Создайте и астройте базу данных:
   ### **product_history**

| **Column**     | **Data Type**               |
|----------------|-----------------------------|
| id             | integer                     |
| product_id     | integer                     |
| shop_id        | integer                     |
| action         | character varying           |
| action_date    | timestamp without time zone |
| details        | text                        |

---

### **products**

| **Column**     | **Data Type**         |
|----------------|-----------------------|
| id             | integer               |
| plu            | character varying     |
| name           | character varying     |

---

### **shops**

| **Column**     | **Data Type**         |
|----------------|-----------------------|
| id             | integer               |
| name           | character varying     |

---

### **stocks**

| **Column**     | **Data Type**         |
|----------------|-----------------------|
| id             | integer               |
| product_id     | integer               |
| shop_id        | integer               |
| shelf_quantity | integer               |
| order_quantity | integer               |

   - Настройте `.env` :
     ```
     DB_USER=
     DB_HOST=
     DB_DATABASE=
     DB_PASSWORD=
     DB_PORT=
     ```

5. Запустите сервисы:
   ```bash
   # Stock Service
   npm start

   # Product History Service
   npm start
   ```

Оба сервиса по умолчанию запускаются на портах:
- Stock Service: `http://localhost:3000`
- Product History Service: `http://localhost:4000`

---

## Примеры запросов

### Stock Service
#### 1. Создание товара

![image](https://github.com/user-attachments/assets/0ff2ba4d-0c66-4bce-9670-95b7abd40780)

#### 2. Создание остатка

![image](https://github.com/user-attachments/assets/50805f45-375a-4e44-97f0-edbd0cfbc377)


#### 3. Увеличение остатка

![image](https://github.com/user-attachments/assets/9358c849-cfcd-4529-8470-64944ad9ebb2)


#### 4. Уменьшение остатка
![image](https://github.com/user-attachments/assets/b67fa01b-eefd-40fe-8782-0798b20890e7)


#### 5. Получение остатков по фильтрам
![image](https://github.com/user-attachments/assets/f82d9eb5-b6d7-42dc-b806-c4f75af1a8f4)

#### 5. Получение товаров по фильтрам
![image](https://github.com/user-attachments/assets/009a1f9e-97bb-4a02-98ea-a56750ce217c)


### Product History Service
![image](https://github.com/user-attachments/assets/58526972-8656-4249-9ff9-0340de20b22e)
![image](https://github.com/user-attachments/assets/6a987e1d-162c-4888-9df6-8ef1c6ab2544)


