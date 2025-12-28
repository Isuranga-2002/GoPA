export function up(knex) {
  return knex.schema.hasTable('authorized_students').then(exists => {
    if (!exists) {
      return knex.schema.createTable('authorized_students', table => {
        table.increments('id').primary();
        table.string('index_number', 20).unique().notNullable();
        table.string('email', 255).unique().notNullable();
        table
          .enu('status', ['pending', 'registered'])
          .defaultTo('pending');
      });
    }
  });
}

export function down(knex) {
  // Baseline migration – do NOT drop existing table
  return Promise.resolve();
}
