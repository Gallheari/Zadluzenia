# Przegląd

Ta aplikacja ma na celu pomoc w śledzeniu osobistych długów z różnych subkont. Umożliwia użytkownikom definiowanie subkont, rejestrowanie pożyczek, dokonywanie spłat i przeglądanie podsumowania swoich długów na pulpicie nawigacyjnym.

# Wdrożone funkcje

*   **Zarządzanie subkontami**: Możliwość dodawania, usuwania i edytowania subkont.
*   **Śledzenie długów**: Możliwość dodawania i usuwania wpisów dotyczących długów.
*   **Pulpit nawigacyjny**: Przegląd wszystkich długów i subkont.
*   **Integracja z Firebase**: Aplikacja jest skonfigurowana do korzystania z Firebase Firestore jako bazy danych.
*   **Repozytorium Git**: Kod źródłowy jest zarządzany w repozytorium na GitHub.
*   **Nowoczesny interfejs użytkownika (MUI)**: Aplikacja została zmodernizowana przy użyciu biblioteki Material-UI, co zapewnia spójny i estetyczny wygląd.
*   **Częściowa spłata długów**: Elastyczny system pozwalający na częściowe spłaty, z automatyczną aktualizacją pozostałej kwoty i historią transakcji.
*   **Interaktywny pulpit nawigacyjny**: Zamiast prostej listy, pulpit główny zawiera teraz:
    *   **Karty statystyk**: Wyświetlają kluczowe wskaźniki, takie jak całkowite zadłużenie, pozostała kwota do spłaty i liczba aktywnych długów.
    *   **Wykres kołowy**: Wizualizuje podział zadłużenia na poszczególne subkonta.
    *   **Wykres słupkowy**: Porównuje całkowitą kwotę długu z kwotą pozostałą do spłaty, pokazując postęp w spłacie.
*   **Historia spłat dla subkonta**: Możliwość przeglądania szczegółowej historii wszystkich spłat dokonanych w ramach danego subkonta, dostępna z poziomu listy subkont.
*   **Przełącznik motywów (jasny/ciemny)**: W prawym górnym rogu paska nawigacyjnego znajduje się przełącznik, który pozwala na dynamiczną zmianę motywu kolorystycznego aplikacji. Użytkownik może wybrać między jasnym a ciemnym wyglądem, aby dostosować aplikację do swoich preferencji i warunków oświetleniowych.
*   **Bezpieczne usuwanie użytkownika**: Zaimplementowano mechanizm bezpiecznego usuwania użytkownika. Aby usunąć konto, należy kliknąć ikonę kosza, a następnie w oknie dialogowym wpisać pełną nazwę użytkownika. Ta procedura zapobiega przypadkowemu usunięciu danych, ponieważ wymaga świadomego potwierdzenia. Usunięcie użytkownika powoduje kaskadowe wyczyszczenie wszystkich jego danych z bazy, w tym subkont, długów i historii spłat.

# Planowane zmiany

Wszelkie przyszłe pomysły i ulepszenia zostaną tu udokumentowane. Na ten moment kluczowe funkcje zostały wdrożone.
