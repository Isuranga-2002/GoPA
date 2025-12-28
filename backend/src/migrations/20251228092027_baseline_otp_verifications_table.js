export function up(knex) {
  return knex.schema.hasTable('otp_verifications').then(exists => {
    if (!exists) {
      return knex.schema.createTable('otp_verifications', table => {
        table.increments('id').primary();
        table.string('email', 255).notNullable();
        table.string('otp', 6).notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
      });
    }
  });
}

export function down(knex) {
  // Baseline migration – do NOT drop existing table
  return Promise.resolve();
}
