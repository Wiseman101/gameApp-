import java.util.Scanner;
import java.util.Random;

public class NumberGuessingGame {
    private static final Scanner scanner = new Scanner(System.in);
    private static final Random random = new Random();
    private static int totalGames = 0;
    private static int totalGuesses = 0;
    private static int bestScore = Integer.MAX_VALUE;

    public static void main(String[] args) {
        boolean playAgain = true;
        
        System.out.println("Welcome to the Smart Number Guessing Game!");
        System.out.println("=========================================");
        
        while (playAgain) {
            playGame();
            playAgain = askToPlayAgain();
        }
        
        displayFinalStats();
        scanner.close();
    }

    private static void playGame() {
        int difficulty = chooseDifficulty();
        int range = getRangeForDifficulty(difficulty);
        int maxNumber = range;
        int minNumber = 1;
        int attempts = 0;
        boolean gameWon = false;

        System.out.println("\nThink of a number between 1 and " + range);
        System.out.println("I'll try to guess it!");
        System.out.println("After each guess, tell me if it's:");
        System.out.println("H - Too High");
        System.out.println("L - Too Low");
        System.out.println("C - Correct");

        while (!gameWon && attempts < 100) {
            int guess = (minNumber + maxNumber) / 2;
            attempts++;
            
            System.out.print("\nMy guess is: " + guess + " (H/L/C)? ");
            String response = scanner.nextLine().toUpperCase();

            switch (response) {
                case "H":
                    maxNumber = guess - 1;
                    break;
                case "L":
                    minNumber = guess + 1;
                    break;
                case "C":
                    gameWon = true;
                    handleWin(attempts);
                    break;
                default:
                    System.out.println("Invalid input! Please enter H, L, or C.");
                    attempts--;
                    break;
            }

            if (minNumber > maxNumber) {
                System.out.println("\nHmm... something seems wrong. Are you sure you're giving me the correct hints?");
                break;
            }
        }

        if (!gameWon) {
            System.out.println("\nI couldn't guess your number in 100 attempts!");
        }
    }

    private static int chooseDifficulty() {
        System.out.println("\nChoose difficulty level:");
        System.out.println("1. Easy (1-50)");
        System.out.println("2. Medium (1-100)");
        System.out.println("3. Hard (1-200)");
        System.out.println("4. Expert (1-500)");
        
        while (true) {
            System.out.print("Enter difficulty (1-4): ");
            try {
                int choice = Integer.parseInt(scanner.nextLine());
                if (choice >= 1 && choice <= 4) {
                    return choice;
                }
            } catch (NumberFormatException e) {
                
            }
            System.out.println("Please enter a number between 1 and 4.");
        }
    }

    private static int getRangeForDifficulty(int difficulty) {
        switch (difficulty) {
            case 1: return 50;
            case 2: return 100;
            case 3: return 200;
            case 4: return 500;
            default: return 100;
        }
    }

    private static void handleWin(int attempts) {
        totalGames++;
        totalGuesses += attempts;
        bestScore = Math.min(bestScore, attempts);
        
        System.out.println("\nI won in " + attempts + " attempts!");
        System.out.println("Current Statistics:");
        System.out.println("Games played: " + totalGames);
        System.out.println("Average guesses: " + String.format("%.2f", (double)totalGuesses/totalGames));
        System.out.println("Best score: " + bestScore + " guesses");
    }

    private static boolean askToPlayAgain() {
        while (true) {
            System.out.print("\nWould you like to play again? (Y/N): ");
            String response = scanner.nextLine().toUpperCase();
            if (response.equals("Y")) return true;
            if (response.equals("N")) return false;
            System.out.println("Please enter Y or N.");
        }
    }

    private static void displayFinalStats() {
        System.out.println("\n=== Final Statistics ===");
        System.out.println("Total games played: " + totalGames);
        if (totalGames > 0) {
            System.out.println("Average guesses per game: " + String.format("%.2f", (double)totalGuesses/totalGames));
            System.out.println("Best score: " + bestScore + " guesses");
        }
        System.out.println("\nThanks for playing!");
    }
} 