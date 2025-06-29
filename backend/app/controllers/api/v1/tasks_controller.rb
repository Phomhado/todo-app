class Api::V1::TasksController < ApplicationController
    def index
        tasks = Task.all
        render json: tasks
    end

    def show
        tasks = Task.find_by(params[:id])
        tasks ? render(json: tasks) : render(json: { error: 'Task not found' }, status: :not_found)
    end
    
    def create
        task = Task.new(task_params)
        if task.save
            render json: task, status: :created
        else
            render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
        end
    end

    def update
        task = Task.find_by(id: params[:id])

        if task.nil?
            render json: { error: 'Task not found' }, status: :not_found
        elsif task.update(task_params)
            render json: task
        else
            render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
        end
    end

    def destroy
        task = Task.find_by(id: params[:id])

        if task.nil?
            render json: { error: 'Task not found' }, status: :not_found
        elsif task.destroy
            head :no_content
        else
            render json: { error: 'Failed to delete task' }, status: :unprocessable_entity
        end
    end

    private

    def task_params
    params.require(:task).permit(:title, :description, :due_date, :column, :done_at)
    end
end
