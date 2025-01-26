-- Query #1 --
INSERT INTO account (
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )
VALUES (
        'Tony',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@n'
    );
-- Query #2 --
UPDATE account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';
-- Query #3 --
DELETE FROM account
WHERE account_email = 'tony@starkent.com';
-- Query #4 --
UPDATE inventory
SET inv_description = REPLACE(
        inv_description,
        'small interiors',
        'a huge interior'
    )
WHERE inv_model = 'GM Hummer';
-- Query #5 --
SELECT i.inv_make,
    i.inv_model,
    c.classification_name
FROM inventory i
    INNER JOIN classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';
-- Query #6 --
UPDATE inventory
SET inv_image = CONCAT(
        '/images/vehicles/',
        SUBSTRING(
            inv_image
            FROM 9
        )
    ),
    inv_thumbnail = CONCAT(
        '/images/vehicles/',
        SUBSTRING(
            inv_thumbnail
            FROM 9
        )
    );