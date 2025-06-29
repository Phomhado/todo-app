class CreateTasks < ActiveRecord::Migration[7.1]
  def change
    create_table :tasks do |t|
      t.string :title
      t.text :description
      t.datetime :due_date
      t.string :column
      t.datetime :done_at

      t.timestamps
    end
  end
end
