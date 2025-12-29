export function up(knex) {
  return knex.schema.hasTable('users').then(exists => {
    if (!exists) {
      return knex.schema.createTable('users', table => {
        table.increments('id').primary();
        table.string('username', 50).notNullable();
        table.string('index_number', 20).unique().notNullable();
        table.string('email', 255).unique().notNullable();
        table.string('password', 255).notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
      });
    }
  });
}

export function down(knex) {
  // ❗ Do nothing (never drop existing production tables)
  return Promise.resolve();
}
